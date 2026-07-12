import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";

const router = Router();

// Add word to dictionary history
router.post("/history", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { word, phonetic, meaning } = req.body;

    if (!word) {
      return res.status(400).json({ error: "Word is required" });
    }

    // Check if the word already exists in user's history
    const existing = await prisma.dictionaryHistory.findFirst({
      where: {
        userId,
        word: {
          equals: word,
          mode: "insensitive"
        }
      }
    });

    if (existing) {
      // Just update the createdAt so it moves to top of history
      const updated = await prisma.dictionaryHistory.update({
        where: { id: existing.id },
        data: { createdAt: new Date(), phonetic, meaning }
      });
      return res.json(updated);
    }

    const historyEntry = await prisma.dictionaryHistory.create({
      data: {
        word,
        phonetic,
        meaning,
        userId
      }
    });

    res.status(201).json(historyEntry);
  } catch (error) {
    console.error("Save dictionary history error:", error);
    res.status(500).json({ error: "Failed to save dictionary history" });
  }
});

// Get dictionary history
router.get("/history", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const history = await prisma.dictionaryHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50 // Limit to recent 50
    });

    res.json(history);
  } catch (error) {
    console.error("Fetch dictionary history error:", error);
    res.status(500).json({ error: "Failed to fetch dictionary history" });
  }
});

// Clear dictionary history
router.delete("/history", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    await prisma.dictionaryHistory.deleteMany({
      where: { userId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Clear dictionary history error:", error);
    res.status(500).json({ error: "Failed to clear dictionary history" });
  }
});

export default router;
