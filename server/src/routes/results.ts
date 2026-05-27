import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, adminMiddleware, authMiddleware } from "../middleware/auth";

const router = Router();

// GET test results
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId, all } = req.query;
    const isAdmin = req.user!.role === "ADMIN";

    const where = all && isAdmin ? {} : { userId: (userId as string) || req.user!.id };

    const results = await prisma.testResult.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        test: { select: { id: true, title: true, type: true } },
        user: { select: { id: true, name: true, username: true, email: true } },
      },
    });

    res.json(results);
  } catch (error) {
    console.error("Fetch test results error:", error);
    res.status(500).json({ error: "Failed to fetch test results" });
  }
});

// POST save test result
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { testId, score, totalQ } = req.body;

    if (!testId || score === undefined || !totalQ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await prisma.testResult.create({
      data: {
        testId,
        score,
        totalQ,
        userId: req.user!.id,
      },
      include: {
        test: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Save test result error:", error);
    res.status(500).json({ error: "Failed to save test result" });
  }
});

export default router;
