"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Helper to sanitize and preserve the original filename for user downloads
const getSafePublicId = (originalname) => {
    const lastDotIndex = originalname.lastIndexOf('.');
    const nameWithoutExt = lastDotIndex !== -1 ? originalname.substring(0, lastDotIndex) : originalname;
    const ext = lastDotIndex !== -1 ? originalname.substring(lastDotIndex) : "";
    const asciiName = nameWithoutExt
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove Vietnamese tones
        .replace(/[^a-zA-Z0-9-_]/g, "_"); // sanitize special characters for safe URLs
    return `${asciiName}_${Date.now()}${ext.toLowerCase()}`;
};
// GET all documents
router.get("/", async (req, res) => {
    try {
        const documents = await prisma_1.prisma.document.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                topic: true,
                user: { select: { name: true, username: true } },
            },
        });
        res.json(documents);
    }
    catch (error) {
        console.error("Fetch documents error:", error);
        res.status(500).json({ error: "Failed to fetch documents" });
    }
});
// POST upload/create document (Admin)
router.post("/", auth_1.adminMiddleware, upload.single("file"), async (req, res) => {
    try {
        const { title, description, type, topicId } = req.body;
        const file = req.file;
        if (!file || !title || !type) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Upload to Cloudinary via stream
        const publicId = getSafePublicId(file.originalname);
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                resource_type: "auto",
                folder: "trainitnow/documents",
                public_id: publicId
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            uploadStream.end(file.buffer);
        });
        const document = await prisma_1.prisma.document.create({
            data: {
                title,
                description: description || null,
                type,
                fileUrl: uploadResult.secure_url,
                topicId: topicId || null,
                userId: req.user.id,
            },
        });
        res.status(201).json(document);
    }
    catch (error) {
        console.error("Upload error details:", error);
        res.status(500).json({ error: error.message || "Failed to upload document" });
    }
});
// GET single document details
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const document = await prisma_1.prisma.document.findUnique({
            where: { id },
            include: {
                topic: true,
                user: { select: { name: true, username: true } },
            },
        });
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }
        res.json(document);
    }
    catch (error) {
        console.error("Fetch single document error:", error);
        res.status(500).json({ error: "Failed to fetch document" });
    }
});
// PUT update document (Admin)
router.put("/:id", auth_1.adminMiddleware, upload.single("file"), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type, topicId } = req.body;
        const file = req.file;
        const existingDoc = await prisma_1.prisma.document.findUnique({ where: { id } });
        if (!existingDoc) {
            return res.status(404).json({ error: "Document not found" });
        }
        let fileUrl = existingDoc.fileUrl;
        if (file) {
            // Upload new file to Cloudinary
            const publicId = getSafePublicId(file.originalname);
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    resource_type: "auto",
                    folder: "trainitnow/documents",
                    public_id: publicId
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                uploadStream.end(file.buffer);
            });
            fileUrl = uploadResult.secure_url;
        }
        const updatedDocument = await prisma_1.prisma.document.update({
            where: { id },
            data: {
                title: title !== undefined ? title : existingDoc.title,
                description: description !== undefined ? description : existingDoc.description,
                type: type !== undefined ? type : existingDoc.type,
                fileUrl,
                topicId: topicId !== undefined ? (topicId || null) : existingDoc.topicId,
            },
        });
        res.json(updatedDocument);
    }
    catch (error) {
        console.error("Update document error:", error);
        res.status(500).json({ error: error.message || "Failed to update document" });
    }
});
// DELETE document (Admin)
router.delete("/:id", auth_1.adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.document.delete({
            where: { id },
        });
        res.json({ message: "Document deleted successfully" });
    }
    catch (error) {
        console.error("Delete document error:", error);
        res.status(500).json({ error: "Failed to delete document" });
    }
});
exports.default = router;
