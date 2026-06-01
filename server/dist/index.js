"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const topics_1 = __importDefault(require("./routes/topics"));
const tests_1 = __importDefault(require("./routes/tests"));
const documents_1 = __importDefault(require("./routes/documents"));
const flashcards_1 = __importDefault(require("./routes/flashcards"));
const results_1 = __importDefault(require("./routes/results"));
const comments_1 = __importDefault(require("./routes/comments"));
const users_1 = __importDefault(require("./routes/users"));
const admin_1 = __importDefault(require("./routes/admin"));
const chat_1 = __importDefault(require("./routes/chat"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow server-to-server or tools with no origin header
        if (!origin) {
            callback(null, true);
            return;
        }
        const clientUrl = process.env.CLIENT_URL;
        const isAllowed = (clientUrl && origin === clientUrl) ||
            origin.endsWith(".vercel.app") ||
            origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:");
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
// Main App API routes
app.use("/api/auth", auth_1.default);
app.use("/api/topics", topics_1.default);
app.use("/api/tests", tests_1.default);
app.use("/api/documents", documents_1.default);
app.use("/api/flashcards", flashcards_1.default);
app.use("/api/test-results", results_1.default);
app.use("/api/comments", comments_1.default);
app.use("/api/users", users_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/chat", chat_1.default);
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TrainItNow API Server</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-color: #0b0f19;
          --panel-bg: rgba(17, 24, 39, 0.7);
          --panel-border: rgba(255, 255, 255, 0.08);
          --text-primary: #f3f4f6;
          --text-secondary: #9ca3af;
          --accent-color: #6366f1;
          --accent-glow: rgba(99, 102, 241, 0.15);
          --success-color: #10b981;
          --success-glow: rgba(16, 185, 129, 0.2);
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: var(--bg-color);
          color: var(--text-primary);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        /* Abstract glowing backgrounds */
        body::before, body::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 0;
          opacity: 0.4;
        }

        body::before {
          background-color: var(--accent-color);
          top: 20%;
          left: 20%;
          animation: float 10s ease-in-out infinite alternate;
        }

        body::after {
          background-color: #ec4899;
          bottom: 20%;
          right: 20%;
          animation: float 12s ease-in-out infinite alternate-reverse;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 30px) scale(1.2); }
        }

        .container {
          position: relative;
          z-index: 1;
          width: 90%;
          max-width: 480px;
        }

        .status-card {
          background: var(--panel-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--panel-border);
          border-radius: 24px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 
                      0 0 0 1px var(--panel-border);
          transform: translateY(0);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .status-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 
                      0 0 30px var(--accent-glow);
        }

        .logo-area {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: var(--accent-color);
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          position: relative;
          box-shadow: 0 0 20px var(--accent-glow);
        }

        .logo-area::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          border: 1px dashed var(--accent-color);
          top: -1px;
          left: -1px;
          animation: spin 20s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--success-color);
          padding: 0.5rem 1.25rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 2rem;
          box-shadow: 0 0 15px var(--success-glow);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: var(--success-color);
          border-radius: 50%;
          position: relative;
        }

        .pulse-dot::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: var(--success-color);
          border-radius: 50%;
          top: 0;
          left: 0;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }

        .info-grid {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: left;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .info-label {
          color: var(--text-secondary);
        }

        .info-value {
          color: var(--text-primary);
          font-weight: 500;
          font-family: monospace;
        }

        .footer {
          color: rgba(255, 255, 255, 0.25);
          font-size: 0.75rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="status-card">
          <div class="logo-area">TN</div>
          <h1>TrainItNow</h1>
          <p class="subtitle">Hệ thống Backend API Server</p>
          
          <div class="status-badge">
            <span class="pulse-dot"></span>
            Online & Running
          </div>

          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Trạng thái</span>
              <span class="info-value" style="color: var(--success-color);">Hoạt động</span>
            </div>
            <div class="info-row">
              <span class="info-label">Thời gian phản hồi</span>
              <span class="info-value">Cực nhanh (&lt;50ms)</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phiên bản</span>
              <span class="info-value">1.0.0</span>
            </div>
            <div class="info-row">
              <span class="info-label">Thời gian hiện tại</span>
              <span class="info-value">${new Date().toLocaleTimeString('vi-VN')}</span>
            </div>
          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} TrainItNow. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});
app.get("/health", (req, res) => {
    res.json({ status: "ok", time: new Date() });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
