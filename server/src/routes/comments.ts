import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, adminMiddleware, authMiddleware } from "../middleware/auth";

const router = Router();

// GET paginated comments for home page
router.get("/", async (req, res) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 5;

    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        user: { select: { name: true, username: true } },
      },
    });

    const total = await prisma.comment.count();
    res.json({ comments, total });
  } catch (error) {
    console.error("Fetch comments error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST add comment
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: req.user!.id,
      },
      include: {
        user: { select: { name: true, username: true } },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Post comment error:", error);
    res.status(500).json({ error: "Failed to post comment" });
  }
});

export default router;
