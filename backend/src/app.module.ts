import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TablesModule } from './tables/tables.module';
import { PrismaService } from './prisma.service';
import { QrTokenModule } from './qr-token/qr-token.module';

@Module({
  imports: [
    TablesModule,
    QrTokenModule,
    JwtModule.register({
      global: true, // Cho phép dùng JwtService ở mọi module
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '365d' }, // QR codes hết hạn sau 1 năm
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
