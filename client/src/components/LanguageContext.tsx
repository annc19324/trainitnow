import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "vi";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.about": "About",
    "nav.topics": "Topics",
    "nav.tests": "Tests",
    "nav.documents": "Documents",
    "nav.flashcards": "Flashcards",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.profile": "My Profile",
    "nav.myTests": "Test History",
    "nav.savedDocs": "Saved Documents",
    "nav.admin": "Admin Dashboard",
    "nav.logout": "Logout",
    "home.title1": "Master English",
    "home.title2": "With Confidence",
    "home.desc": "Your ultimate destination for learning theory, practicing exercises, and taking tests. Prepare effectively for your exams.",
    "home.start": "Start Learning Now",
    "home.browse": "Browse Topics",
    "home.theory.title": "Rich Theory",
    "home.theory.desc": "Access comprehensive and well-structured materials to master grammar, vocabulary, and skills.",
    "home.tests.title": "Dynamic Tests",
    "home.tests.desc": "Take multiple-choice tests, get instant scores, and export your results to PDF.",
    "home.track.title": "Track Progress",
    "home.track.desc": "Monitor your learning journey and view detailed test history.",
    "home.comments.title": "Community Reviews & Comments",
    "home.comments.placeholder": "Leave a review or comment...",
    "home.comments.post": "Post Comment",
    "home.comments.loginReq": "Please log in to leave a comment or review.",
    "home.comments.loading": "Loading...",
    "home.comments.loadMore": "Load older comments",
    "about.title": "About TrainItNow",
    "about.desc": "Empowering learners with high-quality resources, dynamic testing, and a premium educational experience.",
    "about.creator": "About the Creator",
    "about.creator.find": "Find me on all social media platforms as:",
    "about.mission": "Our Mission",
    "about.mission.desc": "TrainItNow was built to solve the fragmentation of learning materials. By combining theoretical documents, interactive exercises, and a robust testing environment, we aim to provide the most comprehensive English learning platform available.",
    "about.f1.title": "Rich Learning Material",
    "about.f1.desc": "Access carefully curated theory documents and exercises designed for all levels.",
    "about.f2.title": "Accessible Anywhere",
    "about.f2.desc": "Our responsive platform ensures you can learn on your laptop, tablet, or mobile phone seamlessly.",
    "about.f3.title": "Quality Testing",
    "about.f3.desc": "Evaluate your skills using our dynamic multiple-choice tests with instant scoring and PDF exports.",
    "auth.login.title": "Welcome Back",
    "auth.login.btn": "Sign In",
    "auth.login.signingIn": "Signing in...",
    "auth.login.footer": "Don't have an account?",
    "auth.register.title": "Create Account",
    "auth.register.btn": "Register",
    "auth.register.registering": "Registering...",
    "auth.register.footer": "Already have an account?",
    "auth.forgot.title": "Reset Password",
    "auth.forgot.desc": "Enter your email address and we'll send you a link to reset your password.",
    "auth.forgot.btn": "Send Reset Link",
    "auth.forgot.sending": "Sending...",
    "auth.forgot.success": "A password reset link has been sent to your email.",
    "auth.forgot.return": "Return to Login",
    "auth.forgot.footer": "Remember your password?",
    "auth.label.email": "Email",
    "auth.label.name": "Name",
    "auth.label.username": "Username",
    "auth.label.emailOrUsername": "Email or Username",
    "auth.label.password": "Password",
    "auth.link.forgot": "Forgot Password?",
    "admin.title": "Dashboard Overview",
    "admin.users": "Users",
    "admin.topics": "Topics",
    "admin.tests": "Tests",
    "admin.documents": "Documents",
    "topics.title": "Learning Topics",
    "topics.desc": "Browse all available grammar and vocabulary topics.",
    "topics.empty.title": "No topics found",
    "topics.empty.desc": "Topics will appear here once an admin creates them.",
    "topics.resources": "resources",
    "topics.noDesc": "No description provided.",
    "tests.title": "Available Tests",
    "tests.desc": "Practice your skills with our dynamic tests.",
    "tests.create": "Create Test",
    "tests.empty.title": "No tests found",
    "tests.empty.desc": "Tests will appear here once an admin creates them.",
    "tests.topic": "Topic:",
    "tests.general": "General",
    "tests.questions": "Questions",
    "docs.title": "Documents & Theory",
    "docs.desc": "Download theory and exercises in PDF or Word formats.",
    "docs.empty.title": "No documents found",
    "docs.empty.desc": "Documents will appear here once uploaded.",
    "docs.download": "Download",
  },
  vi: {
    "nav.about": "Giới thiệu",
    "nav.topics": "Chủ đề",
    "nav.tests": "Bài Kiểm Tra",
    "nav.documents": "Tài liệu",
    "nav.flashcards": "Thẻ ghi nhớ",
    "nav.login": "Đăng nhập",
    "nav.register": "Đăng ký",
    "nav.profile": "Hồ sơ của tôi",
    "nav.myTests": "Lịch sử làm bài",
    "nav.savedDocs": "Tài liệu đã lưu",
    "nav.admin": "Bảng Quản trị",
    "nav.logout": "Đăng xuất",
    "home.title1": "Chinh phục tiếng Anh",
    "home.title2": "Với Sự Tự Tin",
    "home.desc": "Nơi lý tưởng để học lý thuyết, làm bài tập và kiểm tra trình độ. Chuẩn bị hiệu quả nhất cho các kỳ thi của bạn.",
    "home.start": "Bắt đầu học ngay",
    "home.browse": "Xem các chủ đề",
    "home.theory.title": "Lý thuyết phong phú",
    "home.theory.desc": "Truy cập các tài liệu toàn diện được cấu trúc chặt chẽ để nắm vững ngữ pháp, từ vựng và kỹ năng.",
    "home.tests.title": "Bài kiểm tra đa dạng",
    "home.tests.desc": "Thực hiện bài thi trắc nghiệm, nhận điểm ngay lập tức và xuất kết quả ra tệp PDF.",
    "home.track.title": "Theo dõi tiến độ",
    "home.track.desc": "Theo dõi hành trình học tập và xem chi tiết lịch sử làm bài.",
    "home.comments.title": "Đánh giá & Bình luận từ Cộng đồng",
    "home.comments.placeholder": "Để lại đánh giá hoặc bình luận...",
    "home.comments.post": "Gửi bình luận",
    "home.comments.loginReq": "Vui lòng đăng nhập để có thể bình luận hoặc đánh giá.",
    "home.comments.loading": "Đang tải...",
    "home.comments.loadMore": "Xem các bình luận cũ hơn",
    "about.title": "Về TrainItNow",
    "about.desc": "Trao quyền cho người học với các tài nguyên chất lượng cao, bài kiểm tra động và trải nghiệm giáo dục cao cấp.",
    "about.creator": "Thông tin Người tạo",
    "about.creator.find": "Tìm tôi trên tất cả các nền tảng mạng xã hội với tên:",
    "about.mission": "Sứ mệnh của chúng tôi",
    "about.mission.desc": "TrainItNow được xây dựng để giải quyết sự phân mảnh của tài liệu học tập. Bằng cách kết hợp các tài liệu lý thuyết, bài tập tương tác và môi trường kiểm tra mạnh mẽ, chúng tôi hướng tới việc cung cấp nền tảng học tiếng Anh toàn diện nhất có thể.",
    "about.f1.title": "Tài liệu học tập phong phú",
    "about.f1.desc": "Truy cập các tài liệu lý thuyết và bài tập được biên soạn cẩn thận, thiết kế cho mọi cấp độ.",
    "about.f2.title": "Truy cập mọi nơi",
    "about.f2.desc": "Nền tảng phản hồi nhanh của chúng tôi đảm bảo bạn có thể học trên laptop, máy tính bảng hoặc điện thoại di động một cách liền mạch.",
    "about.f3.title": "Kiểm tra chất lượng",
    "about.f3.desc": "Đánh giá kỹ năng của bạn bằng các bài kiểm tra trắc nghiệm động với tính điểm tức thì và xuất PDF.",
    "auth.login.title": "Chào mừng trở lại",
    "auth.login.btn": "Đăng nhập",
    "auth.login.signingIn": "Đang đăng nhập...",
    "auth.login.footer": "Chưa có tài khoản?",
    "auth.register.title": "Tạo tài khoản",
    "auth.register.btn": "Đăng ký",
    "auth.register.registering": "Đang đăng ký...",
    "auth.register.footer": "Đã có tài khoản?",
    "auth.forgot.title": "Khôi phục mật khẩu",
    "auth.forgot.desc": "Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.",
    "auth.forgot.btn": "Gửi liên kết",
    "auth.forgot.sending": "Đang gửi...",
    "auth.forgot.success": "Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn.",
    "auth.forgot.return": "Quay lại Đăng nhập",
    "auth.forgot.footer": "Bạn đã nhớ mật khẩu?",
    "auth.label.email": "Email",
    "auth.label.name": "Họ và tên",
    "auth.label.username": "Tên người dùng",
    "auth.label.emailOrUsername": "Email hoặc Tên người dùng",
    "auth.label.password": "Mật khẩu",
    "auth.link.forgot": "Quên mật khẩu?",
    "admin.title": "Tổng quan Bảng điều khiển",
    "admin.users": "Người dùng",
    "admin.topics": "Chủ đề",
    "admin.tests": "Bài kiểm tra",
    "admin.documents": "Tài liệu",
    "topics.title": "Chủ đề học tập",
    "topics.desc": "Khám phá tất cả các chủ đề ngữ pháp và từ vựng.",
    "topics.empty.title": "Không tìm thấy chủ đề nào",
    "topics.empty.desc": "Chủ đề sẽ xuất hiện ở đây khi quản trị viên tạo chúng.",
    "topics.resources": "tài nguyên",
    "topics.noDesc": "Không có mô tả nào được cung cấp.",
    "tests.title": "Bài kiểm tra hiện có",
    "tests.desc": "Thực hành kỹ năng của bạn với các bài kiểm tra động của chúng tôi.",
    "tests.create": "Tạo bài kiểm tra",
    "tests.empty.title": "Không có bài kiểm tra nào",
    "tests.empty.desc": "Bài kiểm tra sẽ xuất hiện ở đây khi quản trị viên tạo chúng.",
    "tests.topic": "Chủ đề:",
    "tests.general": "Chung",
    "tests.questions": "Câu hỏi",
    "docs.title": "Tài liệu & Lý thuyết",
    "docs.desc": "Tải xuống lý thuyết và bài tập ở định dạng PDF hoặc Word.",
    "docs.empty.title": "Không tìm thấy tài liệu nào",
    "docs.empty.desc": "Tài liệu sẽ xuất hiện ở đây khi được tải lên.",
    "docs.download": "Tải xuống",
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved === "vi" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "vi" : "en";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
