import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { LanguageProvider } from "./components/LanguageContext";
import { ToastProvider } from "./components/ToastContext";
import PullToRefresh from "./components/PullToRefresh";
import Navbar from "./components/Navbar";

// Public / General Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Authenticated User Pages
import Topics from "./pages/Topics";
import TopicDetail from "./pages/TopicDetail";
import Tests from "./pages/Tests";
import TestDetail from "./pages/TestDetail";
import CreateTest from "./pages/CreateTest";
import MyTests from "./pages/MyTests";
import UserProfile from "./pages/UserProfile";
import ChangePassword from "./pages/ChangePassword";
import Documents from "./pages/Documents";
import MyDocuments from "./pages/MyDocuments";
import Chat from "./pages/Chat";

// Flashcard Vocabulary Set Pages
import Flashcards from "./pages/Flashcards";
import FlashcardsStudy from "./pages/FlashcardsStudy";
import FlashcardsEdit from "./pages/FlashcardsEdit";

// Admin Dashboard & Management Pages
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTopics from "./pages/AdminTopics";
import AdminTests from "./pages/AdminTests";
import AdminDocuments from "./pages/AdminDocuments";
import AdminFlashcards from "./pages/AdminFlashcards";
import AdminHistory from "./pages/AdminHistory";
import AdminChats from "./pages/AdminChats";

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <PullToRefresh>
              <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Navbar />
              <main style={{ flex: 1, width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "2rem 2rem 4rem 2rem" }}>
                <Routes>
                {/* Public & General Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Topics & Material Routes */}
                <Route path="/topics" element={<Topics />} />
                <Route path="/topics/:id" element={<TopicDetail />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/my-documents" element={<MyDocuments />} />

                {/* Interactive Practice Tests */}
                <Route path="/tests" element={<Tests />} />
                <Route path="/tests/:id" element={<TestDetail />} />
                <Route path="/tests/create" element={<CreateTest />} />
                <Route path="/my-tests" element={<MyTests />} />

                {/* Vocabulary Flashcard Sets */}
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/flashcards/:id" element={<FlashcardsStudy />} />
                <Route path="/flashcards/:id/edit" element={<FlashcardsEdit />} />

                {/* Profile View */}
                <Route path="/profile/:username" element={<UserProfile />} />
                <Route path="/change-password" element={<ChangePassword />} />

                {/* Chat & Messages Route */}
                <Route path="/chat" element={<Chat />} />

                {/* Protected Administrative Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="topics" element={<AdminTopics />} />
                  <Route path="tests" element={<AdminTests />} />
                  <Route path="documents" element={<AdminDocuments />} />
                  <Route path="flashcards" element={<AdminFlashcards />} />
                  <Route path="history" element={<AdminHistory />} />
                  <Route path="chats" element={<AdminChats />} />
                </Route>

                {/* Wildcard Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer style={{
              textAlign: "center",
              padding: "2rem",
              background: "var(--bg-secondary)",
              borderTop: "var(--glass-border)",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              marginTop: "auto"
            }}>
              <p>&copy; {new Date().getFullYear()} TrainItNow. All rights reserved.</p>
            </footer>
            </div>
            </PullToRefresh>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
