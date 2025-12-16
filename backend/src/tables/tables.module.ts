import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { QrTokenModule } from '../qr-token/qr-token.module';

@Module({
  imports: [QrTokenModule],
  controllers: [TablesController],
  providers: [TablesService, PrismaService],
  exports: [TablesService],
})
export class TablesModule {}
