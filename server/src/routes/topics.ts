import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, adminMiddleware } from "../middleware/auth";

const router = Router();

// GET all topics
router.get("/", async (req, res) => {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { title: "asc" },
    });
    res.json(topics);
  } catch (error) {
    console.error("Fetch topics error:", error);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});

// GET single topic with tests and documents
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        tests: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    res.json(topic);
  } catch (error) {
    console.error("Fetch topic error:", error);
    res.status(500).json({ error: "Failed to fetch topic" });
  }
});

// POST create topic (Admin)
router.post("/", adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        userId: req.user!.id,
      },
    });

    res.status(201).json(topic);
  } catch (error) {
    console.error("Create topic error:", error);
    res.status(500).json({ error: "Failed to create topic" });
  }
});

// PUT update topic (Admin)
router.put("/:id", adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const topic = await prisma.topic.update({
      where: { id },
      data: {
        title,
        description,
      },
    });

    res.json(topic);
  } catch (error) {
    console.error("Update topic error:", error);
    res.status(500).json({ error: "Failed to update topic" });
  }
});

// DELETE topic (Admin)
router.delete("/:id", adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.topic.delete({
      where: { id },
    });

    res.json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("Delete topic error:", error);
    res.status(500).json({ error: "Failed to delete topic" });
  }
});

export default router;
