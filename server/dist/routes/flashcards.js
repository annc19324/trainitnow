"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all flashcard sets
router.get("/", async (req, res) => {
    try {
        const sets = await prisma_1.prisma.flashcardSet.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { flashcards: true } },
            },
        });
        res.json(sets);
    }
    catch (error) {
        console.error("Fetch flashcard sets error:", error);
        res.status(500).json({ error: "Failed to fetch flashcard sets" });
    }
});
// GET single flashcard set
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const set = await prisma_1.prisma.flashcardSet.findUnique({
            where: { id },
            include: {
                flashcards: true,
            },
        });
        if (!set) {
            return res.status(404).json({ error: "Flashcard set not found" });
        }
        res.json(set);
    }
    catch (error) {
        console.error("Fetch flashcard set error:", error);
        res.status(500).json({ error: "Failed to fetch flashcard set" });
    }
});
// POST create flashcard set
router.post("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const { title, description, topicId, flashcards } = req.body;
        if (!title || !flashcards || !Array.isArray(flashcards)) {
            return res.status(400).json({ error: "Missing title or flashcards data" });
        }
        const set = await prisma_1.prisma.flashcardSet.create({
            data: {
                title,
                description,
                topicId: topicId || null,
                userId: req.user.id,
                flashcards: {
                    create: flashcards.map((fc) => ({
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
    }
    catch (error) {
        console.error("Create flashcard set error:", error);
        res.status(500).json({ error: "Failed to create flashcard set" });
    }
});
// PUT update flashcard set
router.put("/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, topicId, flashcards } = req.body;
        // Delete existing cards
        if (flashcards) {
            await prisma_1.prisma.flashcard.deleteMany({
                where: { flashcardSetId: id },
            });
        }
        const updateData = {
            title,
            description,
            topicId: topicId || null,
        };
        if (flashcards && flashcards.length > 0) {
            updateData.flashcards = {
                create: flashcards.map((fc) => ({
                    term: fc.term,
                    definition: fc.definition,
                })),
            };
        }
        const updatedSet = await prisma_1.prisma.flashcardSet.update({
            where: { id },
            data: updateData,
            include: {
                flashcards: true,
            },
        });
        res.json(updatedSet);
    }
    catch (error) {
        console.error("Update flashcard set error:", error);
        res.status(500).json({ error: "Failed to update flashcard set" });
    }
});
// DELETE flashcard set
router.delete("/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.flashcardSet.delete({
            where: { id },
        });
        res.sendStatus(204);
    }
    catch (error) {
        console.error("Delete flashcard set error:", error);
        res.status(500).json({ error: "Failed to delete flashcard set" });
    }
});
exports.default = router;
