import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";

const router = Router();

// GET all flashcard sets
router.get("/", async (req, res) => {
  try {
    const sets = await prisma.flashcardSet.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { flashcards: true } },
      },
    });
    res.json(sets);
  } catch (error) {
    console.error("Fetch flashcard sets error:", error);
    res.status(500).json({ error: "Failed to fetch flashcard sets" });
  }
});

// GET single flashcard set
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const set = await prisma.flashcardSet.findUnique({
      where: { id },
      include: {
        flashcards: true,
      },
    });

    if (!set) {
      return res.status(404).json({ error: "Flashcard set not found" });
    }

    res.json(set);
  } catch (error) {
    console.error("Fetch flashcard set error:", error);
    res.status(500).json({ error: "Failed to fetch flashcard set" });
  }
});

// POST create flashcard set
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, description, topicId, flashcards } = req.body;

    if (!title || !flashcards || !Array.isArray(flashcards)) {
      return res.status(400).json({ error: "Missing title or flashcards data" });
    }

    const set = await prisma.flashcardSet.create({
      data: {
        title,
        description,
        topicId: topicId || null,
        userId: req.user!.id,
        flashcards: {
          create: flashcards.map((fc: any) => ({
            term: fc.term,
            definition: fc.definition,
          })),
        },
      },
      include: {
        flashcards: true,
      },
    });

    res.status(201).json(set);
  } catch (error) {
    console.error("Create flashcard set error:", error);
    res.status(500).json({ error: "Failed to create flashcard set" });
  }
});

// PUT update flashcard set
router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, topicId, flashcards } = req.body;

    // Delete existing cards
    if (flashcards) {
      await prisma.flashcard.deleteMany({
        where: { flashcardSetId: id },
      });
    }

    const updateData: any = {
      title,
      description,
      topicId: topicId || null,
    };

    if (flashcards && flashcards.length > 0) {
      updateData.flashcards = {
        create: flashcards.map((fc: any) => ({
          term: fc.term,
          definition: fc.definition,
        })),
      };
    }

    const updatedSet = await prisma.flashcardSet.update({
      where: { id },
      data: updateData,
      include: {
        flashcards: true,
      },
    });

    res.json(updatedSet);
  } catch (error) {
    console.error("Update flashcard set error:", error);
    res.status(500).json({ error: "Failed to update flashcard set" });
  }
});

// DELETE flashcard set
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.flashcardSet.delete({
      where: { id },
    });

    res.sendStatus(204);
  } catch (error) {
    console.error("Delete flashcard set error:", error);
    res.status(500).json({ error: "Failed to delete flashcard set" });
  }
});

export default router;
