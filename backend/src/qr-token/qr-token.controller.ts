import { Controller, Post, Param } from '@nestjs/common';
import { QrTokenService } from './qr-token.service';

@Controller('tables')
export class QrTokenController {
  constructor(private qrTokenService: QrTokenService) {}

  @Post(':id/qr/generate')
  async generateQr(@Param('id') tableId: string) {
    return this.qrTokenService.generateToken(tableId);
  }
}
