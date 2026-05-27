"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET test results
router.get("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId, all } = req.query;
        const isAdmin = req.user.role === "ADMIN";
        const where = all && isAdmin ? {} : { userId: userId || req.user.id };
        const results = await prisma_1.prisma.testResult.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                test: { select: { id: true, title: true, type: true } },
                user: { select: { id: true, name: true, username: true, email: true } },
            },
        });
        res.json(results);
    }
    catch (error) {
        console.error("Fetch test results error:", error);
        res.status(500).json({ error: "Failed to fetch test results" });
    }
});
// POST save test result
router.post("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const { testId, score, totalQ } = req.body;
        if (!testId || score === undefined || !totalQ) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const result = await prisma_1.prisma.testResult.create({
            data: {
                testId,
                score,
                totalQ,
                userId: req.user.id,
            },
            include: {
                test: { select: { id: true, title: true } },
            },
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Save test result error:", error);
        res.status(500).json({ error: "Failed to save test result" });
    }
});
exports.default = router;
