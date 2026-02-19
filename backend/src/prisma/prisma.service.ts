import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Initialize the Postgres adapter with your connection string
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    // 2. Pass the adapter to the base PrismaClient constructor
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log("Prisma connected to Postgres successfully via adapter.");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}