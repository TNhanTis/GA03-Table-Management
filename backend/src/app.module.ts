import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TablesModule } from './tables/tables.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [TablesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
