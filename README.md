# Table Management System - Smart Restaurant

Hệ thống quản lý bàn cho nhà hàng thông minh với tính năng tạo và quản lý mã QR cho từng bàn ăn.

## 📋 Tổng quan

Dự án **Table Management** là module quản lý bàn trong hệ thống Smart Restaurant, bao gồm:

- **Backend**: NestJS + Prisma + PostgreSQL (Supabase)
- **Frontend**: React + Vite + TypeScript
- **Chức năng chính**:
  - ✅ Quản lý bàn ăn (CRUD - Create, Read, Update, Delete)
  - ✅ Tạo mã QR với token bảo mật (JWT)
  - ✅ Tải xuống/in mã QR (PNG, PDF, ZIP)
  - ✅ Tái tạo và vô hiệu hóa mã QR
  - ✅ Quản lý trạng thái bàn (Active/Inactive)

## 🎯 Yêu cầu hệ thống

- **Node.js**: >= 16.x
- **npm**: >= 8.x
- **PostgreSQL**: >= 14.x (hoặc Supabase)

## 🚀 Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd GA03-Table-Management
```

### 2. Cài đặt dependencies

#### Cài đặt dependencies cho cả Backend và Frontend

```bash
# Root level
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Cấu hình Database

Dự án này sử dụng **Supabase PostgreSQL**. File `.env` đã được cấu hình sẵn trong `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:Baodzvcl00@db.lhoiazdtwdviiwigctbo.supabase.co:5432/postgres
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
```

#### Tạo Prisma Client và chạy Migration

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Chạy migration để tạo bảng tables
npx prisma migrate deploy

# Hoặc push schema trực tiếp (development)
npx prisma db push
```

**Lưu ý**: Nếu dùng database PostgreSQL local, thay đổi `DATABASE_URL` trong file `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### 4. Kiểm tra Database Schema

Schema `tables` đã được định nghĩa trong `backend/prisma/schema.prisma`:

```prisma
model Table {
  id                 String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  table_number       String    @unique @db.VarChar(50)
  capacity           Int
  location           String?   @db.VarChar(100)
  description        String?   @db.Text
  status             String    @default("active") @db.VarChar(20)
  qr_token           String?   @db.VarChar(500)
  qr_token_created_at DateTime? @db.Timestamp(6)
  created_at         DateTime  @default(now()) @db.Timestamp(6)
  updated_at         DateTime  @updatedAt @db.Timestamp(6)
}
```

## ▶️ Chạy dự án

### Development Mode (Khuyến nghị)

#### Chạy Backend

```bash
cd backend
npm run start:dev
```

Backend sẽ chạy tại: **http://localhost:3000**

#### Chạy Frontend (Terminal mới)

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

### Production Mode

#### Build và chạy Backend

```bash
cd backend
npm run build
npm run start:prod
```

#### Build và preview Frontend

```bash
cd frontend
npm run build
npm run preview
```

## 🛠️ Các lệnh Scripts

### Backend Scripts

| Script      | Lệnh                  | Mô tả                                       |
| ----------- | --------------------- | ------------------------------------------- |
| Development | `npm run start:dev`   | Chạy server với watch mode (tự động reload) |
| Production  | `npm run start:prod`  | Chạy server production                      |
| Build       | `npm run build`       | Build dự án                                 |
| Debug       | `npm run start:debug` | Chạy debug mode                             |
| Lint        | `npm run lint`        | Chạy ESLint và tự động fix                  |
| Test        | `npm run test`        | Chạy unit tests                             |
| Test E2E    | `npm run test:e2e`    | Chạy end-to-end tests                       |

### Frontend Scripts

| Script      | Lệnh              | Mô tả                    |
| ----------- | ----------------- | ------------------------ |
| Development | `npm run dev`     | Chạy dev server với HMR  |
| Build       | `npm run build`   | Build production         |
| Preview     | `npm run preview` | Preview production build |
| Lint        | `npm run lint`    | Chạy ESLint              |

## 🗄️ Cấu trúc Database

### Bảng: `tables`

| Cột                   | Kiểu dữ liệu | Mô tả                                     |
| --------------------- | ------------ | ----------------------------------------- |
| `id`                  | UUID         | Primary key (auto-generated)              |
| `table_number`        | VARCHAR(50)  | Số/tên bàn (unique)                       |
| `capacity`            | INT          | Sức chứa (1-20 người)                     |
| `location`            | VARCHAR(100) | Vị trí/khu vực (VD: Indoor, Outdoor, VIP) |
| `description`         | TEXT         | Mô tả bàn (optional)                      |
| `status`              | VARCHAR(20)  | Trạng thái: 'active' hoặc 'inactive'      |
| `qr_token`            | VARCHAR(500) | JWT token cho QR code                     |
| `qr_token_created_at` | TIMESTAMP    | Thời gian tạo QR token                    |
| `created_at`          | TIMESTAMP    | Thời gian tạo bàn                         |
| `updated_at`          | TIMESTAMP    | Thời gian cập nhật gần nhất               |

## 📡 API Endpoints

### Table Management

| Method | Endpoint                 | Mô tả                          |
| ------ | ------------------------ | ------------------------------ |
| GET    | `/api/tables`            | Lấy danh sách tất cả bàn       |
| GET    | `/api/tables/:id`        | Lấy thông tin chi tiết một bàn |
| POST   | `/api/tables`            | Tạo bàn mới                    |
| PUT    | `/api/tables/:id`        | Cập nhật thông tin bàn         |
| PATCH  | `/api/tables/:id/status` | Cập nhật trạng thái bàn        |
| DELETE | `/api/tables/:id`        | Xóa bàn                        |

### QR Code Management

| Method | Endpoint                               | Mô tả                       |
| ------ | -------------------------------------- | --------------------------- |
| POST   | `/api/qr-token/generate/:tableId`      | Tạo/tái tạo QR code cho bàn |
| GET    | `/api/qr-export/download/:tableId`     | Tải QR code dạng PNG        |
| GET    | `/api/qr-export/download-pdf/:tableId` | Tải QR code dạng PDF        |
| GET    | `/api/qr-export/download-all`          | Tải tất cả QR codes (ZIP)   |

### Menu Verification

| Method | Endpoint                           | Mô tả                          |
| ------ | ---------------------------------- | ------------------------------ |
| GET    | `/api/menu?table=:id&token=:token` | Xác thực QR token và load menu |

## 🧰 Công nghệ sử dụng

### Backend

- **[NestJS](https://nestjs.com/)** v11 - Progressive Node.js framework
- **[Prisma](https://www.prisma.io/)** v7.1 - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Database (Supabase)
- **[JWT](https://jwt.io/)** - Token signing cho QR codes
- **[qrcode](https://www.npmjs.com/package/qrcode)** v1.5 - QR code generation
- **[PDFKit](http://pdfkit.org/)** v0.17 - PDF generation
- **[Archiver](https://www.npmjs.com/package/archiver)** v7.0 - ZIP file creation

### Frontend

- **[React](https://react.dev/)** v19.2 - UI library
- **[Vite](https://vitejs.dev/)** v7.3 - Build tool & dev server
- **[TypeScript](https://www.typescriptlang.org/)** v5.9 - Type safety
- **[React Router](https://reactrouter.com/)** v7.10 - Routing
- **[Axios](https://axios-http.com/)** v1.13 - HTTP client
- **[react-qr-code](https://www.npmjs.com/package/react-qr-code)** v2.0 - QR display component

## 📂 Cấu trúc thư mục

```
GA03-Table-Management/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Migration files
│   ├── src/
│   │   ├── main.ts               # Entry point
│   │   ├── app.module.ts         # Root module
│   │   ├── tables/               # Tables CRUD module
│   │   ├── qr-token/             # QR token generation
│   │   ├── qr-export/            # QR download/export
│   │   ├── menu/                 # Menu module
│   │   └── prisma/               # Prisma service
│   ├── .env                      # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # Entry point
│   │   ├── App.tsx               # Root component
│   │   ├── pages/                # Page components
│   │   ├── components/           # Reusable components
│   │   ├── api/                  # API services
│   │   └── contexts/             # React contexts
│   └── package.json
│
├── README.md                     # This file
└── Week_TableManagement.md       # Assignment requirements
```

## 📚 Tài liệu tham khảo

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Assignment Details](./Week_TableManagement.md)
- [QRCode.js](https://github.com/soldair/node-qrcode)
- [PDFKit Guide](http://pdfkit.org/docs/guide.pdf)

## 📝 Ghi chú

### Token QR Format

QR code chứa URL dạng:

```
http://localhost:5173/menu?table={tableId}&token={signedJWT}
```

JWT Token chứa:

- `tableId`: ID của bàn
- `iat`: Thời gian tạo (issued at)
- `exp`: Thời gian hết hạn (expiration - optional)

### Bảo mật

- JWT secret nên thay đổi trong production
- Token được verify trên backend trước khi cho phép truy cập menu
- Database credentials không được commit lên Git

## 📄 License

UNLICENSED - Private academic project
