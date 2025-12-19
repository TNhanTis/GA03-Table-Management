import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
@Controller('api') // ← Base route: /api
export class MenuController {
  constructor(
    private jwtService: JwtService, // ← Inject JwtService
    private prisma: PrismaService, // ← Inject PrismaService
  ) {}
  // ━━━ API: Verify QR token và hiển thị menu ━━━
  @Get('menu') // ← Full route: GET /api/menu
  async verifyQrAndShowMenu(
    @Query('table') tableId: string, // ← Query param: ?table=...
    @Query('token') token: string, // ← Query param: &token=...
  ) {
    // ━━━ BƯỚC 1: Validate input ━━━
    if (!tableId || !token) {
      throw new BadRequestException('Missing table or token parameter');
    }
    // ━━━ BƯỚC 2: Lấy thông tin bàn từ DB ━━━
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      throw new BadRequestException('Table not found');
    }

    // ━━━ BƯỚC 3: So sánh token với DB ━━━
    // Ý nghĩa: Kiểm tra token có phải là token MỚI NHẤT không
    if (table.qr_token !== token) {
      throw new BadRequestException('Invalid or expired QR code');
    }

    // ━━━ BƯỚC 4: Verify chữ ký (signature) của token ━━━
    // Ý nghĩa: Kiểm tra token có bị giả mạo không
    try {
      const decoded = this.jwtService.verify(token);
      console.log('Token payload:', decoded); // Debug log
    } catch (error) {
      throw new BadRequestException('Invalid token signature');
    }

    // ━━━ BƯỚC 5: Kiểm tra bàn có active không ━━━
    // Ý nghĩa: Bàn inactive thì không cho order
    if (table.status !== 'active') {
      throw new BadRequestException('This table is currently unavailable');
    }

    // ━━━ BƯỚC 6: Trả về menu ━━━
    // TODO: Sau này query menu thật từ DB
    return {
      success: true,
      message: `Welcome to ${table.table_number}!`,
      tableInfo: {
        id: table.id,
        number: table.table_number,
        capacity: table.capacity,
        location: table.location,
      },
      menu: [
        { id: 1, name: 'Phở Bò', price: 50000, image: '/images/pho.jpg' },
        { id: 2, name: 'Bún Chả', price: 45000, image: '/images/bun-cha.jpg' },
        { id: 3, name: 'Cơm Tấm', price: 40000, image: '/images/com-tam.jpg' },
      ],
    };
  }
}
