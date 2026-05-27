import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import topicRoutes from "./routes/topics";
import testRoutes from "./routes/tests";
import documentRoutes from "./routes/documents";
import flashcardRoutes from "./routes/flashcards";
import resultRoutes from "./routes/results";
import commentRoutes from "./routes/comments";
import userRoutes from "./routes/users";
import adminRoutes from "./routes/admin";
import chatRoutes from "./routes/chat";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Main App API routes
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/test-results", resultRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
