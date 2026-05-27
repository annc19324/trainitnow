"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/counts", auth_1.adminMiddleware, async (req, res) => {
    try {
        const [topicCount, testCount, documentCount, userCount, historyCount] = await Promise.all([
            prisma_1.prisma.topic.count(),
            prisma_1.prisma.test.count(),
            prisma_1.prisma.document.count(),
            prisma_1.prisma.user.count(),
            prisma_1.prisma.testResult.count(),
        ]);
        res.json({
            topicCount,
            testCount,
            documentCount,
            userCount,
            historyCount,
        });
    }
    catch (error) {
        console.error("Fetch counts error:", error);
        res.status(500).json({ error: "Failed to fetch counts" });
    }
});
exports.default = router;
