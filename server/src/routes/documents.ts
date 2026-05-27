import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, adminMiddleware, authMiddleware } from "../middleware/auth";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const router = Router();
const upload = multer();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all documents
router.get("/", async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        topic: true,
        user: { select: { name: true, username: true } },
      },
    });
    res.json(documents);
  } catch (error) {
    console.error("Fetch documents error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// POST upload/create document (Admin)
router.post("/", adminMiddleware, upload.single("file"), async (req: AuthRequest, res) => {
  try {
    const { title, description, type, topicId } = req.body;
    const file = req.file;

    if (!file || !title || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upload to Cloudinary via stream
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "trainitnow/documents" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    const document = await prisma.document.create({
      data: {
        title,
        description: description || null,
        type,
        fileUrl: uploadResult.secure_url,
        topicId: topicId || null,
        userId: req.user!.id,
      },
    });

    res.status(201).json(document);
  } catch (error: any) {
    console.error("Upload error details:", error);
    res.status(500).json({ error: error.message || "Failed to upload document" });
  }
});

// DELETE document (Admin)
router.delete("/:id", adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.document.delete({
      where: { id },
    });

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
