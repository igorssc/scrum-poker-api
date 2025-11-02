import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  if (global.__prisma) {
    return global.__prisma;
  }

  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    datasources: {
      db: {
        url: process.env.POSTGRES_URL,
      },
    },
    ...(process.env.NODE_ENV === 'production' && {
      transactionOptions: {
        timeout: 5000, // 5 seconds timeout
      },
    }),
  });

  global.__prisma = client;

  return client;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private static instance: PrismaService;
  private client: PrismaClient;

  constructor() {
    if (PrismaService.instance) {
      return PrismaService.instance;
    }

    this.client = createPrismaClient();
    PrismaService.instance = this;
  }

  get $connect() {
    return this.client.$connect.bind(this.client);
  }

  get $transaction() {
    return this.client.$transaction.bind(this.client);
  }

  get $queryRaw() {
    return this.client.$queryRaw.bind(this.client);
  }

  get $executeRaw() {
    return this.client.$executeRaw.bind(this.client);
  }

  get user() {
    return this.client.user;
  }

  get room() {
    return this.client.room;
  }

  get member() {
    return this.client.member;
  }

  async onModuleInit() {
    try {
      if (!this.client || this.client.$connect === undefined) {
        this.client = createPrismaClient();
      }

      await this.client.$connect();

      console.log('✅ Database connected successfully');

      if (process.env.NODE_ENV === 'production') {
        process.on('beforeExit', async () => {
          await this.safeDisconnect();
        });

        process.on('SIGTERM', async () => {
          await this.safeDisconnect();
        });
      }
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      if (process.env.NODE_ENV !== 'production') {
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    await this.safeDisconnect();
  }

  private async safeDisconnect() {
    try {
      if (this.client) {
        await this.client.$disconnect();
        console.log('✅ Database disconnected');
      }
      global.__prisma = undefined;
    } catch (error) {
      console.warn(
        '⚠️ Disconnect warning (non-critical):',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async $disconnect() {
    await this.safeDisconnect();
  }
}
