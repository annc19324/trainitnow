# TrainItNow - Hệ thống học tiếng Anh trực tuyến (Monorepo)

**TrainItNow** là một nền tảng học tiếng Anh trực tuyến toàn diện, được thiết kế với giao diện cao cấp (Sleek Glassmorphism), hỗ trợ đầy đủ các công cụ học tập từ ôn luyện từ vựng, thẻ ghi nhớ (Flashcards), hệ thống làm bài kiểm tra trắc nghiệm/tự luận, lưu trữ tài liệu lý thuyết/bài tập, đến sơ đồ phát âm IPA 44 âm tiết tương tác trực quan.

Dự án được cấu trúc theo mô hình **Monorepo** bao gồm cả Frontend (Vite + React) và Backend (Express + Prisma + Neon Postgres).

---

## 🌟 Tính năng nổi bật

### 1. Bảng ký tự IPA 44 âm tiết tương tác
* Hiển thị đầy đủ 44 âm tiết trong tiếng Anh (Nguyên âm đơn, nguyên âm đôi, phụ âm).
* Tích hợp chức năng tìm kiếm thời gian thực và bộ lọc phân loại thông minh.
* Phát âm âm tiết mẫu và từ ví dụ đi kèm sử dụng bộ tổng hợp giọng nói chất lượng cao.
* Giao diện Glassmorphism hiện đại, tối ưu hiển thị trên cả máy tính và thiết bị di động.

### 2. Hệ thống kiểm tra trực tuyến (Tests)
* Hỗ trợ các dạng bài kiểm tra Trắc nghiệm (Multiple Choice) và Tự luận (Essay).
* Trộn câu trả lời ngẫu nhiên (Answer Shuffling) tránh đoán mò kết quả.
* Tự động chấm điểm lập tức đối với bài trắc nghiệm và lưu trữ lịch sử kết quả.
* Giao diện làm bài trực quan, tự động cuộn lên đầu trang khi nộp bài và tối ưu hóa hiển thị di động.
* Xuất đề thi chất lượng cao ra file PDF trực tiếp (sử dụng công nghệ client-side html2canvas & jsPDF).

### 3. Thẻ ghi nhớ thông minh (Flashcards)
* Hỗ trợ tạo bộ thẻ ghi nhớ (Flashcard Sets) theo từng chủ đề.
* Giao diện học tập tối giản, hỗ trợ hiệu ứng lật thẻ mượt mà, phát âm từ vựng (TTS) và ghi nhận kết quả học tập nhanh ("Đã thuộc" / "Chưa thuộc").

### 4. Quản lý tài liệu học tập
* Hỗ trợ đăng tải, phân loại tài liệu (Lý thuyết / Bài tập) theo từng chủ đề.
* Cho phép người dùng tải xuống tài liệu và thảo luận thông qua hệ thống bình luận thời gian thực.

---

## 🛠️ Công nghệ sử dụng

### Frontend (`/client`)
* **React 19** & **TypeScript**
* **Vite** (Build Tool siêu tốc)
* **React Router 7** (Quản lý định tuyến)
* **Lucide React** (Hệ thống icon sắc nét)
* **Vanilla CSS Module** (Thiết kế giao diện tùy biến, Glassmorphism & Animations mượt mà)

### Backend (`/server`)
* **Node.js** & **Express** & **TypeScript**
* **Prisma ORM** & **PostgreSQL** (Neon Serverless Postgres Database)
* **Cloudinary** (Lưu trữ file tài liệu và hình ảnh)
* **Nodemailer** (Gửi email khôi phục mật khẩu)
* **JWT (JSON Web Token)** & **Bcryptjs** (Bảo mật tài khoản)

---

## 🚀 Hướng dẫn chạy dự án dưới Local

### 1. Cài đặt các thư viện
Tại thư mục gốc của dự án, chạy lệnh sau để tự động cài đặt thư viện cho cả Client và Server:
```bash
npm run install:all
```

### 2. Cấu hình biến môi trường (`.env`)

#### Cấu hình cho Backend (`/server/.env`):
Tạo file `.env` bên trong thư mục `/server` và thêm vào các khóa sau:
```env
DATABASE_URL="postgresql://..." # Neon Postgres Connection String
JWT_SECRET="your_jwt_secret_key"
PORT=3001
CLIENT_URL="http://localhost:5173"

CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

### 3. Khởi tạo Cơ sở dữ liệu (Prisma)
Đẩy cấu trúc bảng lên Database của bạn:
```bash
cd server
npx prisma db push
```

### 4. Chạy dự án trong chế độ Development
Tại thư mục gốc, bạn có thể chạy song song cả 2 dịch vụ bằng các lệnh tương ứng ở 2 cửa sổ terminal:

* **Chạy Backend Server** (chạy tại cổng `http://localhost:3001`):
  ```bash
  npm run dev:server
  ```

* **Chạy Frontend Client** (chạy tại cổng `http://localhost:5173`):
  ```bash
  npm run dev:client
  ```

---

## ☁️ Hướng dẫn Triển khai (Deployment)

### 1. Triển khai Backend lên Render (`https://trainitnow.onrender.com/`)
1. Tạo một **Web Service** mới trên Render và liên kết với Github của bạn.
2. Thiết lập các thông số:
   * **Root Directory**: `server`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
3. Trong tab **Environment**, thêm đầy đủ các biến môi trường tương tự như file `/server/.env` ở local (Nhớ đổi `CLIENT_URL` thành domain Production của Frontend).

### 2. Triển khai Frontend lên Vercel
1. Triển khai thư mục `/client` lên Vercel.
2. Thêm biến môi trường trong phần cấu hình của Vercel:
   * **`VITE_API_URL`** = `https://trainitnow.onrender.com`
   *(Nhờ cấu hình này, khi chạy trên Vercel, client sẽ tự động gọi API tới backend Render thay vì localhost).*

---

## 🔄 Quy trình cập nhật hệ thống
Khi bạn thực hiện bất kỳ thay đổi nào ở máy local và muốn cập nhật lên Production:
1. Lưu lại các thay đổi và commit bằng Git:
   ```bash
   git add .
   git commit -m "Mô tả thay đổi của bạn"
   git push origin main
   ```
2. Render và Vercel sẽ tự động phát hiện mã nguồn mới trên Github nhánh `main` và thực hiện biên dịch lại tự động.
