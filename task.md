#### 🧑‍💻 Thành viên 1: The Foundation & CRUD (3.5 điểm)

_Người này sẽ dựng khung database và tính năng quản lý bàn cơ bản. Đây là nền móng._

- **Backend:**
  - Tạo Entity/Model `Table` trong database (theo schema đề bài: `id`, `table_number`, `capacity`, `location`, `status`, `qr_token`).
  - Viết API CRUD:
    - `POST /tables`: Tạo bàn (Validate: số bàn trùng, sức chứa 1-20).
    - `GET /tables`: Lấy danh sách (Filter theo status, location).
    - `PUT /tables/:id`: Sửa thông tin.
    - `PATCH /tables/:id/status`: Soft delete (Chuyển status sang inactive).
- **Frontend:**
  - Dựng giao diện trang "Quản lý bàn" (Table List).
  - Làm Modal/Form "Thêm mới bàn" & "Sửa bàn".
  - Làm chức năng Filter (Lọc theo khu vực/trạng thái).

#### 🧑‍💻 Thành viên 2: The Logic Master - QR Generation & Verify (3.5 điểm)

_Người này lo phần logic khó nhất: Sinh mã Token bảo mật và quy trình xác thực._

- **Backend:**
  - Cấu hình `JwtService` (hoặc hàm sign token riêng).
  - Viết API `POST /tables/:id/qr/generate`:
    - Tạo payload: `{ tableId, restaurantId, timestamp }`.
    - Sign token bằng secret key.
    - Lưu token vào database (cột `qr_token`).
  - Viết API `POST /tables/:id/qr/regenerate`:
    - Logic giống trên nhưng đè token cũ -\> Token cũ tự động vô hiệu hóa.
  - Viết API `GET /api/menu?token=...`:
    - Middleware/Guard kiểm tra token có khớp với DB không. Nếu khớp trả về menu, không khớp báo lỗi.
- **Frontend:**
  - Hiển thị hình ảnh QR Code trong từng dòng của bảng (dùng `react-qr-code`).
  - Làm nút "Regenerate QR" (có popup cảnh báo).
  - Dựng trang Public (trang khách hàng quét mã): Hiển thị Menu hoặc thông báo lỗi nếu Token sai.

#### 🧑‍💻 Thành viên 3: The File Handler - Export & UI Polish (3 điểm)

_Người này lo phần xuất file, in ấn và làm đẹp giao diện._

- **Backend:**
  - Viết Service tạo PDF (dùng `pdfkit`): Vẽ khung, chèn logo, chèn ảnh QR, thêm text hướng dẫn.
  - Viết API `GET /tables/:id/qr/download`: Trả về file PNG hoặc PDF.
  - Viết API `GET /tables/qr/download-all`:
    - Dùng `archiver` để nén tất cả ảnh QR thành file `.zip`.
    - Hoặc tạo 1 file PDF nhiều trang.
- **Frontend:**
  - Giao diện In ấn (Print Preview): Dùng `react-to-print` để setup khổ giấy in ngay trên trình duyệt.
  - Các nút chức năng: "Download PNG", "Download PDF", "Download All".
  - Styling: Trau chuốt CSS cho Admin Dashboard (làm đẹp các thẻ trạng thái Active/Inactive, bố cục Grid/List).

---

### Sơ đồ luồng làm việc (Workflow)

Để tránh việc đợi nhau, các bạn nên làm theo thứ tự sau:

1.  **Bước 1 (Chung):** Thống nhất Database Schema (file `.sql` hoặc Entity TypeORM/Prisma). Chạy migration để mọi người có cùng DB.
2.  **Bước 2 (Độc lập):**
    - **TV1:** Viết CRUD API.
    - **TV2:** Viết hàm sinh JWT Token (chưa cần lưu DB vội, chỉ cần log ra console test trước).
    - **TV3:** Nghiên cứu `react-to-print` và tạo layout file PDF mẫu.
3.  **Bước 3 (Ghép nối):**
    - Sau khi TV1 xong API tạo bàn -\> TV2 gắn hàm sinh Token vào lúc tạo bàn.
    - Sau khi TV2 sinh được Token -\> TV3 lấy Token đó để tạo file PDF thật.

### Lưu ý quan trọng cho nhóm

1.  **URL Token:** Đề bài yêu cầu URL dạng `https://domain.com/menu?table={id}&token={token}`. Khi code ở local, hãy để là `http://localhost:5173/menu?...`.
2.  **Bảo mật:** Token lưu trong Database (`qr_token`) là để đối chiếu. Khi quét mã, Backend phải so sánh token gửi lên có trùng với token đang lưu trong DB của bàn đó không. Nếu khác -\> Báo lỗi (Đây là cơ chế Invalidate cũ).
3.  **Validation:** TV1 chú ý validate `capacity > 0` và `capacity <= 20` ngay trong DTO của NestJS.
