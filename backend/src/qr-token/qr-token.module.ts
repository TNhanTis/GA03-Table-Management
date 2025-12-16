import { Module } from '@nestjs/common';
import { QrTokenService } from './qr-token.service';

@Module({
    providers: [QrTokenService],
    exports: [QrTokenService], // Export để dùng ở TablesModule và MenuModule
})
export class QrTokenModule { }
