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
  origin: (origin, callback) => {
    // Allow server-to-server or tools with no origin header
    if (!origin) {
      callback(null, true);
      return;
    }

    const clientUrl = process.env.CLIENT_URL;
    const isAllowed = 
      (clientUrl && origin === clientUrl) ||
      origin.endsWith(".vercel.app") ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:");

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
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
