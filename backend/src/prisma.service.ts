import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

// Load Prisma client from the built generated folder.
// At runtime, require() resolves relative to __dirname which is dist/src/,
// so we go up to dist/generated/prisma.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('../../generated/prisma');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

