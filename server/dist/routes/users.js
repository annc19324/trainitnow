"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all users (Admin only)
router.get("/", auth_1.adminMiddleware, async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        console.error("Fetch users error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
// GET single user profile details (Public or Authenticated)
router.get("/profile/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { name: username },
                ],
            },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Fetch profile error:", error);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});
// PUT update user (Admin only)
router.put("/:id", auth_1.adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { role, name } = req.body;
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id },
            data: { role, name },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ error: "Failed to update user" });
    }
});
// DELETE user (Admin only)
router.delete("/:id", auth_1.adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.id === id) {
            return res.status(400).json({ error: "You cannot delete yourself" });
        }
        await prisma_1.prisma.user.delete({
            where: { id },
        });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
});
exports.default = router;
