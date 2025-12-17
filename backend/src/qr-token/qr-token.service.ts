import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class QrTokenService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}
  async generateToken(tableId: string) {
    // 1. Lấy thông tin bàn từ DB
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    // 2. Tạo payload
    const payload = {
      tableId: tableId,
      restaurantId: 'RESTAURANT_001', // Hardcode hoặc lấy từ config
      timestamp: new Date().toISOString(),
    };

    // 3. Sign token
    const token = this.jwtService.sign(payload);

    // 4. Lưu token vào DB
    await this.prisma.table.update({
      where: { id: tableId },
      data: {
        qr_token: token,
        qr_token_created_at: new Date(),
      },
    });

    // 5. Tạo URL đầy đủ
    const qrUrl = `http://localhost:5173/menu?table=${tableId}&token=${token}`;

    return { token, qrUrl };
  }
}
