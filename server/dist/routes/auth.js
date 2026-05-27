"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/register", async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        if (!name || !username || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email or username" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                username,
                email,
                password: hashedPassword,
                role: "USER",
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, username: user.username, role: user.role, avatarUrl: user.avatarUrl }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const identifier = email || req.body.username || req.body.identifier;
        if (!identifier || !password) {
            return res.status(400).json({ error: "Missing email/username or password" });
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            },
        });
        if (!user || !user.password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, username: user.username, role: user.role, avatarUrl: user.avatarUrl }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
const nodemailer_1 = __importDefault(require("nodemailer"));
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Missing email" });
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ error: "Email không tồn tại trên hệ thống!" });
        }
        // Generate random 8-character temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
        const hashedPassword = await bcryptjs_1.default.hash(tempPassword, 10);
        // Update user's password in database
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        // Send email via SMTP
        const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
        const smtpPort = parseInt(process.env.SMTP_PORT || "587");
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        if (!smtpUser || !smtpPass || smtpUser.includes("placeholder") || smtpPass.includes("xxxx")) {
            console.warn("SMTP credentials not configured. Temp password is:", tempPassword);
            return res.json({
                message: "Mật khẩu mới đã được thiết lập (SMTP chưa cấu hình).",
                tempPassword,
                demoMode: true
            });
        }
        const transporter = nodemailer_1.default.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });
        const mailOptions = {
            from: `"TrainItNow Support" <${smtpUser}>`,
            to: user.email,
            subject: "Khôi phục mật khẩu - TrainItNow",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
          <h2 style="color: #1e3a8a;">Yêu cầu đặt lại mật khẩu</h2>
          <p>Xin chào <strong>${user.name}</strong>,</p>
          <p>Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn trên hệ thống TrainItNow.</p>
          <p>Mật khẩu tạm thời mới của bạn là:</p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 1.2rem; font-weight: bold; text-align: center; color: #1e3a8a; margin: 20px 0;">
            ${tempPassword}
          </div>
          <p style="color: #ef4444; font-weight: 500;">Vui lòng đăng nhập bằng mật khẩu này và đổi lại mật khẩu mới trong phần Hồ sơ cá nhân ngay lập tức để bảo mật tài khoản.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 0.8rem; color: #6b7280;">Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này hoặc liên hệ hỗ trợ.</p>
        </div>
      `,
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: "Mật khẩu mới đã được gửi tới email của bạn!" });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: "Lỗi máy chủ khi khôi phục mật khẩu." });
    }
});
router.get("/me", auth_1.authMiddleware, (req, res) => {
    res.json({ user: req.user });
});
exports.default = router;
