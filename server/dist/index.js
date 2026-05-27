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
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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
app.get("/health", (req, res) => {
    res.json({ status: "ok", time: new Date() });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
