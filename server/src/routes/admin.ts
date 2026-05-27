import { Router } from "express";
import { prisma } from "../lib/prisma";
import { adminMiddleware } from "../middleware/auth";

const router = Router();

router.get("/counts", adminMiddleware, async (req, res) => {
  try {
    const [topicCount, testCount, documentCount, userCount, historyCount] = await Promise.all([
      prisma.topic.count(),
      prisma.test.count(),
      prisma.document.count(),
      prisma.user.count(),
      prisma.testResult.count(),
    ]);

    res.json({
      topicCount,
      testCount,
      documentCount,
      userCount,
      historyCount,
    });
  } catch (error) {
    console.error("Fetch counts error:", error);
    res.status(500).json({ error: "Failed to fetch counts" });
  }
});

export default router;
