import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface QrTokenPayload {
  tableId: string;
  restaurantId: string;
  timestamp: number;
}

@Injectable()
export class QrTokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Sinh JWT token cho một bàn
   * @param tableId - ID của bàn
   * @param restaurantId - ID nhà hàng (cho multi-tenant)
   * @returns Signed JWT token string
   */
  generateQrToken(
    tableId: string,
    restaurantId: string = 'default-restaurant',
  ): string {
    const payload: QrTokenPayload = {
      tableId,
      restaurantId,
      timestamp: Date.now(),
    };

    // Sign payload thành JWT token
    return this.jwtService.sign(payload);
  }

  /**
   * Verify và decode QR token
   * @param token - JWT token cần verify
   * @returns Decoded payload nếu token hợp lệ
   * @throws UnauthorizedException nếu token không hợp lệ hoặc hết hạn
   */
  verifyQrToken(token: string): QrTokenPayload {
    try {
      return this.jwtService.verify<QrTokenPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('QR Code không hợp lệ hoặc đã hết hạn');
    }
  }

  /**
   * Tạo URL đầy đủ để mã hóa vào QR code
   * @param tableId - ID của bàn
   * @param token - JWT token
   * @returns URL đầy đủ với params table và token
   */
  generateQrUrl(tableId: string, token: string): string {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    return `${frontendUrl}/menu?table=${tableId}&token=${token}`;
  }
}
