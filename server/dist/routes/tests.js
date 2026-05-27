"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all tests
router.get("/", async (req, res) => {
    try {
        const tests = await prisma_1.prisma.test.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                topic: { select: { title: true } },
                _count: { select: { questions: true } },
            },
        });
        res.json(tests);
    }
    catch (error) {
        console.error("Fetch tests error:", error);
        res.status(500).json({ error: "Failed to fetch tests" });
    }
});
// GET single test with questions and answers
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const test = await prisma_1.prisma.test.findUnique({
            where: { id },
            include: {
                questions: {
                    include: {
                        answers: true,
                    },
                },
            },
        });
        if (!test) {
            return res.status(404).json({ error: "Test not found" });
        }
        res.json(test);
    }
    catch (error) {
        console.error("Fetch test error:", error);
        res.status(500).json({ error: "Failed to fetch test" });
    }
});
// POST create test with questions (Admin)
router.post("/", auth_1.adminMiddleware, async (req, res) => {
    try {
        const { title, description, topicId, type, questions } = req.body;
        if (!title || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: "Missing required fields or invalid questions format" });
        }
        const test = await prisma_1.prisma.test.create({
            data: {
                title,
                description,
                type: type || "MULTIPLE_CHOICE",
                topicId: topicId || null,
                userId: req.user.id,
                questions: {
                    create: questions.map((q) => ({
                        content: q.content,
                        type: q.type || "MULTIPLE_CHOICE",
                        answers: {
                            create: q.answers.map((a) => ({
                                content: a.content,
                                isCorrect: a.isCorrect || false,
                            })),
                        },
                    })),
                },
            },
        });
        res.status(201).json(test);
    }
    catch (error) {
        console.error("Create test error:", error);
        res.status(500).json({ error: "Failed to create test" });
    }
});
// DELETE test (Admin)
router.delete("/:id", auth_1.adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.test.delete({
            where: { id },
        });
        res.json({ message: "Test deleted successfully" });
    }
    catch (error) {
        console.error("Delete test error:", error);
        res.status(500).json({ error: "Failed to delete test" });
    }
});
exports.default = router;
