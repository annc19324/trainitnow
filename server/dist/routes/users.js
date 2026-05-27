"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
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
                email: true,
                role: true,
                avatarUrl: true,
                createdAt: true,
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
// POST upload user avatar (Authenticated)
const upload = (0, multer_1.default)();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
router.post("/profile/avatar", auth_1.authMiddleware, upload.single("avatar"), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No avatar file provided" });
        }
        // Upload stream to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({ resource_type: "image", folder: "trainitnow/avatars" }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            uploadStream.end(file.buffer);
        });
        res.json({ avatarUrl: uploadResult.secure_url });
    }
    catch (error) {
        console.error("Avatar upload error:", error);
        res.status(500).json({ error: "Failed to upload avatar" });
    }
});
// PUT update current user profile (Authenticated)
router.put("/profile/update", auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, username, email, avatarUrl, currentPassword, newPassword } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Check unique username/email if changed
        if (username && username !== user.username) {
            const existing = await prisma_1.prisma.user.findUnique({ where: { username } });
            if (existing) {
                return res.status(400).json({ error: "Username is already taken" });
            }
        }
        if (email && email !== user.email) {
            const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (existing) {
                return res.status(400).json({ error: "Email is already taken" });
            }
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (username !== undefined)
            updateData.username = username;
        if (email !== undefined)
            updateData.email = email;
        if (avatarUrl !== undefined)
            updateData.avatarUrl = avatarUrl;
        // Handle password change if requested
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Current password is required to set a new password" });
            }
            const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Incorrect current password" });
            }
            updateData.password = await bcryptjs_1.default.hash(newPassword, 10);
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                avatarUrl: true,
            },
        });
        // Sign new JWT token
        const token = jsonwebtoken_1.default.sign({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            username: updatedUser.username,
            role: updatedUser.role,
            avatarUrl: updatedUser.avatarUrl
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({
            user: updatedUser,
            token,
        });
    }
    catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ error: "Failed to update profile" });
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
