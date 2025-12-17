# Implementation Plan: JWT Module Configuration for QR Token Management

## Tổng quan

Document này chi tiết hóa các bước cấu hình JWT Module trong NestJS để hỗ trợ tính năng QR Token Management cho hệ thống Table Management. Mỗi bước sẽ được giải thích rõ ràng về **ý nghĩa** và **cách triển khai cụ thể**.

---

## Bước 1: Cài đặt Dependencies

### 📖 Ý nghĩa
Cài đặt các package cần thiết để làm việc với JWT (JSON Web Token) trong NestJS. JWT được sử dụng để tạo token bảo mật cho QR code của mỗi bàn.

### 🛠️ Cách triển khai

```bash
npm install @nestjs/jwt @nestjs/config
npm install -D @types/jsonwebtoken
```

**Giải thích từng package:**
- `@nestjs/jwt`: Module chính thức của NestJS để làm việc với JWT
- `@nestjs/config`: Module để đọc biến môi trường từ file `.env`
- `@types/jsonwebtoken`: Type definitions cho TypeScript

**Kiểm tra cài đặt:**
Sau khi cài đặt, kiểm tra file `package.json`:
```json
{
  "dependencies": {
    "@nestjs/jwt": "^10.x.x",
    "@nestjs/config": "^3.x.x"
  }
}
```

---

## Bước 2: Cấu hình biến môi trường (.env)

### 📖 Ý nghĩa
Lưu trữ thông tin nhạy cảm (secret key, thời gian hết hạn) trong file `.env` thay vì hard-code trong source code. Điều này:
- ✅ Bảo mật hơn (không commit secret key lên Git)
- ✅ Dễ thay đổi giữa các môi trường (dev/staging/production)
- ✅ Tuân theo best practices (12-factor app)

### 🛠️ Cách triển khai

**File: `backend/.env`**
```env
# JWT Configuration
JWT_SECRET=your_super_secret_key_here_minimum_32_characters_long
JWT_EXPIRES_IN=30d

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/restaurant_db
```

**Quy tắc chọn giá trị:**

| Biến | Ý nghĩa | Ví dụ giá trị | Lưu ý |
|------|---------|---------------|--------|
| `JWT_SECRET` | Khóa bí mật để ký token | `MySecretKey123!@#$%^&*()` | Phải dài ít nhất 32 ký tự, phức tạp |
| `JWT_EXPIRES_IN` | Thời gian hết hạn token | `30d`, `7d`, `24h`, `3600` | `d`=ngày, `h`=giờ, số=giây |

**⚠️ Lưu ý bảo mật:**
```bash
# File: .gitignore
.env
.env.local
.env.production
```
Đảm bảo file `.env` đã được thêm vào `.gitignore`!

---

## Bước 3: Import Dependencies vào Module

### 📖 Ý nghĩa
Import các module và service cần thiết vào `qr-token.module.ts` để có thể sử dụng chức năng JWT và truy cập database.

### 🛠️ Cách triển khai

**File: [qr-token.module.ts](file:///d:/Hk1-2526/Web/GA03/backend/src/qr-token/qr-token.module.ts)**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';                    // ← JWT Module
import { ConfigModule, ConfigService } from '@nestjs/config'; // ← Config Module
import { PrismaModule } from '../prisma/prisma.module';      // ← Database Module

import { QrTokenService } from './qr-token.service';
import { QrTokenController } from './qr-token.controller';
```

**Giải thích từng import:**

| Import | Mục đích | Sử dụng ở đâu |
|--------|----------|---------------|
| `JwtModule` | Cung cấp `JwtService` để sign/verify token | Inject vào `QrTokenService` |
| `ConfigModule` | Đọc biến môi trường từ `.env` | Inject vào factory function |
| `ConfigService` | Service để lấy giá trị config | Lấy `JWT_SECRET` và `JWT_EXPIRES_IN` |
| `PrismaModule` | Truy cập database | Lưu/kiểm tra token trong DB |

---

## Bước 4: Cấu hình JwtModule với registerAsync

### 📖 Ý nghĩa
Sử dụng `registerAsync()` thay vì `register()` để cấu hình JWT một cách **động** (dynamic configuration). Điều này cho phép:
- ✅ Đọc config từ `ConfigService` thay vì hard-code
- ✅ Hỗ trợ async operations (nếu cần load config từ remote)
- ✅ Linh hoạt thay đổi config theo môi trường

### 🛠️ Cách triển khai

**File: [qr-token.module.ts](file:///d:/Hk1-2526/Web/GA03/backend/src/qr-token/qr-token.module.ts#L12-L21)**

```typescript
@Module({
    imports: [
        PrismaModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('JWT_EXPIRES_IN') || '30d',
                },
            }),
        }),
    ],
    providers: [QrTokenService],
    controllers: [QrTokenController],
    exports: [QrTokenService],
})
export class QrTokenModule { }
```

**Phân tích chi tiết từng phần:**

#### 4.1. `JwtModule.registerAsync({})`
```typescript
JwtModule.registerAsync({...})
```
- **Ý nghĩa:** Đăng ký module theo cách bất đồng bộ
- **Khác với `register()`:** `register()` nhận config tĩnh, `registerAsync()` nhận factory function

#### 4.2. `imports: [ConfigModule]`
```typescript
imports: [ConfigModule],
```
- **Ý nghĩa:** Import `ConfigModule` vào scope của factory function
- **Tại sao cần:** Để có thể inject `ConfigService` ở bước tiếp theo

#### 4.3. `inject: [ConfigService]`
```typescript
inject: [ConfigService],
```
- **Ý nghĩa:** Yêu cầu NestJS inject (tiêm) `ConfigService` vào tham số của `useFactory`
- **Dependency Injection:** ConfigService sẽ được tự động tạo và truyền vào hàm

#### 4.4. `useFactory: async (configService) => {...}`
```typescript
useFactory: async (configService: ConfigService) => ({...})
```
- **Ý nghĩa:** Hàm factory trả về cấu hình JWT
- **Tham số:** `configService` - được inject từ bước 4.3
- **Return type:** `JwtModuleOptions` object

#### 4.5. `secret: configService.get<string>('JWT_SECRET')`
```typescript
secret: configService.get<string>('JWT_SECRET'),
```
- **Ý nghĩa:** Khóa bí mật để sign và verify JWT token
- **Đọc từ:** Biến môi trường `JWT_SECRET` trong file `.env`
- **Sử dụng:** Khi gọi `jwtService.sign(payload)` và `jwtService.verify(token)`

**⚠️ Quan trọng:** Secret key phải giống nhau khi sign và verify!

#### 4.6. `signOptions.expiresIn`
```typescript
signOptions: {
    expiresIn: configService.get('JWT_EXPIRES_IN') || '30d',
},
```
- **Ý nghĩa:** Thời gian hết hạn của token
- **Default value:** Nếu không có `JWT_EXPIRES_IN` trong `.env`, dùng `'30d'` (30 ngày)
- **Format hợp lệ:**
  - Số: `3600` (3600 giây = 1 giờ)
  - String: `'2 days'`, `'10h'`, `'7d'`

**🔧 Fix lỗi TypeScript:**
```typescript
// ❌ SAI - Gây lỗi type error
expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '30d',

// ✅ ĐÚNG - Bỏ <string> để TypeScript tự infer
expiresIn: configService.get('JWT_EXPIRES_IN') || '30d',
```

**Giải thích lỗi:** NestJS JWT module mong đợi type `number | StringValue | undefined`, trong khi `string` là type quá chung. Bỏ explicit type annotation để TypeScript tự động infer đúng type.

---

## Bước 5: Export QrTokenService

### 📖 Ý nghĩa
Export `QrTokenService` để các module khác (ví dụ: `QrExportModule`, `OrderModule`) có thể import và sử dụng service này.

### 🛠️ Cách triển khai

```typescript
@Module({
    imports: [...],
    providers: [QrTokenService],
    controllers: [QrTokenController],
    exports: [QrTokenService], // ← Export service
})
export class QrTokenModule { }
```

**Khi nào cần import QrTokenModule:**

```typescript
// File: qr-export/qr-export.module.ts
@Module({
    imports: [QrTokenModule], // ← Import để dùng QrTokenService
    providers: [QrExportService],
    controllers: [QrExportController],
})
export class QrExportModule { }
```

```typescript
// File: qr-export/qr-export.service.ts
@Injectable()
export class QrExportService {
    constructor(
        private qrTokenService: QrTokenService, // ← Inject được vì đã export
    ) {}
}
```

---

## Bước 6: Sử dụng JwtService trong QrTokenService

### 📖 Ý nghĩa
Sau khi cấu hình xong `JwtModule`, chúng ta có thể inject `JwtService` vào service và sử dụng các method:
- `sign(payload)` - Tạo token
- `verify(token)` - Xác thực token

### 🛠️ Cách triển khai

**File: [qr-token.service.ts](file:///d:/Hk1-2526/Web/GA03/backend/src/qr-token/qr-token.service.ts)**

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QrTokenService {
    constructor(
        private jwtService: JwtService,     // ← Inject JwtService
        private prisma: PrismaService,      // ← Inject PrismaService
    ) {}

    async generateToken(tableId: string) {
        // 1️⃣ Lấy thông tin bàn từ DB
        const table = await this.prisma.table.findUnique({
            where: { id: tableId },
        });

        if (!table) {
            throw new Error('Table not found');
        }

        // 2️⃣ Tạo payload cho JWT
        const payload = {
            tableId: tableId,
            restaurantId: 'RESTAURANT_001',
            timestamp: new Date().toISOString(),
        };

        // 3️⃣ Sign token với secret key từ .env
        const token = this.jwtService.sign(payload);
        // Token sẽ tự động hết hạn sau JWT_EXPIRES_IN

        // 4️⃣ Lưu token vào database
        await this.prisma.table.update({
            where: { id: tableId },
            data: {
                qr_token: token,
                qr_token_created_at: new Date(),
            },
        });

        // 5️⃣ Tạo URL đầy đủ cho QR code
        const qrUrl = `http://localhost:5173/menu?table=${tableId}&token=${token}`;

        return { token, qrUrl };
    }

    async verifyToken(token: string) {
        try {
            // 1️⃣ Verify token signature và expiration
            const payload = this.jwtService.verify(token);

            // 2️⃣ Kiểm tra token có tồn tại trong DB không
            const table = await this.prisma.table.findFirst({
                where: {
                    id: payload.tableId,
                    qr_token: token, // ← Token phải khớp với DB
                },
            });

            if (!table) {
                throw new Error('Invalid or regenerated token');
            }

            return { valid: true, tableId: payload.tableId };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
}
```

**Flow hoạt động:**

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant QrTokenService
    participant JwtService
    participant Database

    Client->>Controller: POST /tables/:id/qr/generate
    Controller->>QrTokenService: generateToken(tableId)
    QrTokenService->>Database: Lấy thông tin bàn
    Database-->>QrTokenService: table object
    QrTokenService->>JwtService: sign(payload)
    Note over JwtService: Sử dụng JWT_SECRET<br/>và JWT_EXPIRES_IN từ .env
    JwtService-->>QrTokenService: token string
    QrTokenService->>Database: Lưu token vào table.qr_token
    QrTokenService-->>Controller: { token, qrUrl }
    Controller-->>Client: JSON response
```

---

## Bước 7: Thêm API Endpoints

### 📖 Ý nghĩa
Tạo các API endpoints để frontend có thể gọi và sử dụng chức năng JWT.

### 🛠️ Cách triển khai

**File: `qr-token.controller.ts`**

```typescript
import { Controller, Post, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { QrTokenService } from './qr-token.service';

@Controller('qr-token')
export class QrTokenController {
    constructor(private qrTokenService: QrTokenService) {}

    // API: POST /qr-token/generate/:tableId
    @Post('generate/:tableId')
    async generateQrToken(@Param('tableId') tableId: string) {
        try {
            const result = await this.qrTokenService.generateToken(tableId);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    // API: GET /qr-token/verify?token=xxx
    @Get('verify')
    async verifyQrToken(@Query('token') token: string) {
        const result = await this.qrTokenService.verifyToken(token);
        
        if (!result.valid) {
            throw new HttpException(
                'Invalid or expired QR code',
                HttpStatus.UNAUTHORIZED,
            );
        }

        return {
            success: true,
            tableId: result.tableId,
        };
    }
}
```

**Sử dụng API từ Frontend:**

```typescript
// Generate QR Token
const response = await fetch('http://localhost:3000/qr-token/generate/TABLE_001', {
    method: 'POST',
});
const data = await response.json();
console.log(data.data.token); // JWT token
console.log(data.data.qrUrl); // URL cho QR code

// Verify Token
const verifyResponse = await fetch(
    `http://localhost:3000/qr-token/verify?token=${token}`
);
const verifyData = await verifyResponse.json();
console.log(verifyData.tableId); // TABLE_001
```

---

## Bước 8: Testing và Validation

### 📖 Ý nghĩa
Kiểm tra xem cấu hình JWT có hoạt động đúng không, token có được sign và verify thành công không.

### 🛠️ Cách triển khai

#### 8.1. Test bằng Postman/Thunder Client

**Test 1: Generate Token**
```http
POST http://localhost:3000/qr-token/generate/TABLE_001
```

**Expected Response:**
```json
{
    "success": true,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "qrUrl": "http://localhost:5173/menu?table=TABLE_001&token=eyJhbGci..."
    }
}
```

**Test 2: Verify Token**
```http
GET http://localhost:3000/qr-token/verify?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response:**
```json
{
    "success": true,
    "tableId": "TABLE_001"
}
```

#### 8.2. Decode JWT Token

Sử dụng [jwt.io](https://jwt.io) để decode token và xem payload:

**Token example:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiVEFCTEVfMDAxIiwicmVzdGF1cmFudElkIjoiUkVTVEFVUkFOVF8wMDEiLCJ0aW1lc3RhbXAiOiIyMDI1LTEyLTE3VDEzOjUwOjAwLjAwMFoiLCJpYXQiOjE3MzQ0NDkwMDAsImV4cCI6MTczNzA0MTAwMH0.signature
```

**Decoded Payload:**
```json
{
  "tableId": "TABLE_001",
  "restaurantId": "RESTAURANT_001",
  "timestamp": "2025-12-17T13:50:00.000Z",
  "iat": 1734449000,
  "exp": 1737041000
}
```

**Giải thích:**
- `iat` (Issued At): Thời điểm tạo token (Unix timestamp)
- `exp` (Expiration): Thời điểm hết hạn token

---

## Tổng kết Flow hoàn chỉnh

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. Cài đặt & Configuration                    │
│  npm install → .env setup → JwtModule.registerAsync()          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  2. Generate QR Token (Admin)                    │
│  POST /tables/:id/qr/generate → Sign JWT → Save to DB          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   3. Display QR Code (Admin)                     │
│  Nhận token → Tạo QR code image → Download PNG/PDF             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 4. Customer Scans QR Code                        │
│  Quét mã → Truy cập URL với token → Gửi lên backend            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   5. Verify Token (Backend)                      │
│  GET /menu?token=xxx → jwtService.verify() → Check DB          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    6. Return Menu or Error                       │
│  Valid: Show menu    │    Invalid: Show error message           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Checklist hoàn thành

- [ ] Cài đặt `@nestjs/jwt` và `@nestjs/config`
- [ ] Thêm `JWT_SECRET` và `JWT_EXPIRES_IN` vào `.env`
- [ ] Cấu hình `JwtModule.registerAsync()` trong `qr-token.module.ts`
- [ ] Fix lỗi TypeScript với `expiresIn`
- [ ] Implement `generateToken()` trong `QrTokenService`
- [ ] Implement `verifyToken()` trong `QrTokenService`
- [ ] Tạo API endpoints trong `QrTokenController`
- [ ] Test APIs bằng Postman
- [ ] Verify token trên jwt.io

---

## Tài liệu tham khảo

- [NestJS JWT Documentation](https://docs.nestjs.com/security/authentication#jwt-functionality)
- [JWT.io - Decode tokens](https://jwt.io/)
- [ConfigService Documentation](https://docs.nestjs.com/techniques/configuration)
