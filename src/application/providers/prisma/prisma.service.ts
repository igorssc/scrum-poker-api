import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Se já existe uma instância global, reutiliza ela
    if (global.__prisma) {
      super();
      Object.setPrototypeOf(this, global.__prisma);
      return global.__prisma as any;
    }

    // Cria nova instância apenas se não existir
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    });

    // Armazena a instância globalmente
    global.__prisma = this;
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    global.__prisma = undefined;
    console.log('✅ Database disconnected');
  }
}
