import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TablesModule } from './tables/tables.module';
import { PrismaService } from './prisma.service';
import { QrTokenModule } from './qr-token/qr-token.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // <--- Để dùng biến env ở mọi nơi mà không cần import lại ConfigModule
    }),

    TablesModule,
    QrTokenModule,
    JwtModule.register({
      global: true, // Cho phép dùng JwtService ở mọi module
      secret:
        process.env.JWT_SECRET ||
        'ba4def4bd866ba455b67c7f6d87024b1fa265632b276e33b0eef64f24cc00d3b',
      signOptions: { expiresIn: '365d' }, // QR codes hết hạn sau 1 năm
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
