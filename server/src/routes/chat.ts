import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../lib/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload = multer();

const router = Router();

// Get community groups
router.get("/groups", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const groups = await prisma.chatGroup.findMany({
      where: { isCommunity: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(groups);
  } catch (error) {
    console.error("Fetch groups error:", error);
    res.status(500).json({ error: "Failed to fetch community groups" });
  }
});

// Get direct chat partners list with unread counts
router.get("/direct", authMiddleware, async (req: AuthRequest, res) => {
  const currentUserId = req.user!.id;
  try {
    // Find all users the current user has chatted with
    const sentMessages = await prisma.chatMessage.findMany({
      where: { senderId: currentUserId, groupId: null },
      select: { receiverId: true },
    });

    const receivedMessages = await prisma.chatMessage.findMany({
      where: { receiverId: currentUserId, groupId: null },
      select: { senderId: true },
    });

    const userIds = new Set<string>();
    sentMessages.forEach((m) => m.receiverId && userIds.add(m.receiverId));
    receivedMessages.forEach((m) => m.senderId && userIds.add(m.senderId));

    if (userIds.size === 0) {
      return res.json([]);
    }

    const partners = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
      },
    });

    // Compute unread count for each partner
    const partnersWithUnread = await Promise.all(
      partners.map(async (partner) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            senderId: partner.id,
            receiverId: currentUserId,
            isRead: false,
          },
        });
        return {
          ...partner,
          unreadCount,
        };
      })
    );

    res.json(partnersWithUnread);
  } catch (error) {
    console.error("Fetch direct chats error:", error);
    res.status(500).json({ error: "Failed to fetch direct chats" });
  }
});

// Get total unread count for direct messages
router.get("/unread-count", authMiddleware, async (req: AuthRequest, res) => {
  const currentUserId = req.user!.id;
  try {
    const unreadCount = await prisma.chatMessage.count({
      where: {
        receiverId: currentUserId,
        isRead: false,
      },
    });
    res.json({ unreadCount });
  } catch (error) {
    console.error("Fetch unread count error:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// Search users by name or username to start a direct chat
router.get("/search-users", authMiddleware, async (req: AuthRequest, res) => {
  const currentUserId = req.user!.id;
  const { query } = req.query;

  if (!query || String(query).trim() === "") {
    return res.json([]);
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { name: { contains: String(query), mode: "insensitive" } },
              { username: { contains: String(query), mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
      },
      take: 10,
    });
    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

// Get messages for a group or direct chat partner
router.get("/messages", authMiddleware, async (req: AuthRequest, res) => {
  const currentUserId = req.user!.id;
  const { groupId, userId } = req.query;

  try {
    if (groupId) {
      const messages = await prisma.chatMessage.findMany({
        where: { groupId: String(groupId) },
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: { id: true, name: true, username: true, avatarUrl: true },
          },
        },
      });
      return res.json(messages);
    }

    if (userId) {
      const partnerId = String(userId);

      // Mark received messages from this partner as read
      await prisma.chatMessage.updateMany({
        where: {
          senderId: partnerId,
          receiverId: currentUserId,
          isRead: false,
        },
        data: { isRead: true },
      });

      const messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: partnerId },
            { senderId: partnerId, receiverId: currentUserId },
          ],
        },
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: { id: true, name: true, username: true, avatarUrl: true },
          },
        },
      });
      return res.json(messages);
    }

    res.status(400).json({ error: "Provide groupId or userId query parameter" });
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Post a new message
router.post("/messages", authMiddleware, async (req: AuthRequest, res) => {
  const currentUserId = req.user!.id;
  const { content, groupId, receiverId } = req.body;

  if (!content || (!groupId && !receiverId)) {
    return res.status(400).json({ error: "Message content and destination (groupId or receiverId) are required" });
  }

  try {
    const message = await prisma.chatMessage.create({
      data: {
        content,
        senderId: currentUserId,
        groupId: groupId || null,
        receiverId: receiverId || null,
        isRead: false,
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    });
    res.status(201).json(message);
  } catch (error) {
    console.error("Post message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/* ADMIN GROUP MANAGEMENT */

// Add community group
router.post("/admin/groups", authMiddleware, async (req: AuthRequest, res) => {
  if (req.user!.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { name, description, avatarUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Group name is required" });
  }

  try {
    const group = await prisma.chatGroup.create({
      data: {
        name,
        description,
        avatarUrl: avatarUrl || null,
        isCommunity: true,
      },
    });
    res.status(201).json(group);
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// Edit community group
router.put("/admin/groups/:id", authMiddleware, async (req: AuthRequest, res) => {
  if (req.user!.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { id } = req.params;
  const { name, description, avatarUrl } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Group name is required" });
  }

  try {
    const updateData: any = { name, description };
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    const group = await prisma.chatGroup.update({
      where: { id },
      data: updateData,
    });
    res.json(group);
  } catch (error) {
    console.error("Update group error:", error);
    res.status(500).json({ error: "Failed to update group" });
  }
});

// Upload avatar for a community group
router.post("/admin/groups/:id/avatar", authMiddleware, upload.single("avatar"), async (req: AuthRequest, res) => {
  if (req.user!.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { id } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file provided" });

  try {
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "trainitnow/group-avatars" },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      stream.end(file.buffer);
    });

    const group = await prisma.chatGroup.update({
      where: { id },
      data: { avatarUrl: uploadResult.secure_url },
    });
    res.json({ avatarUrl: uploadResult.secure_url, group });
  } catch (error) {
    console.error("Group avatar upload error:", error);
    res.status(500).json({ error: "Failed to upload group avatar" });
  }
});

// Delete community group
router.delete("/admin/groups/:id", authMiddleware, async (req: AuthRequest, res) => {
  if (req.user!.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { id } = req.params;

  try {
    await prisma.chatGroup.delete({
      where: { id },
    });
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Delete group error:", error);
    res.status(500).json({ error: "Failed to delete group" });
  }
});

export default router;
