"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET paginated comments for home page
router.get("/", async (req, res) => {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 5;
        const comments = await prisma_1.prisma.comment.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take,
            include: {
                user: { select: { name: true, username: true } },
            },
        });
        const total = await prisma_1.prisma.comment.count();
        res.json({ comments, total });
    }
    catch (error) {
        console.error("Fetch comments error:", error);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});
// POST add comment
router.post("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: "Comment content cannot be empty" });
        }
        const comment = await prisma_1.prisma.comment.create({
            data: {
                content: content.trim(),
                userId: req.user.id,
            },
            include: {
                user: { select: { name: true, username: true } },
            },
        });
        res.status(201).json(comment);
    }
    catch (error) {
        console.error("Post comment error:", error);
        res.status(500).json({ error: "Failed to post comment" });
    }
});
exports.default = router;
