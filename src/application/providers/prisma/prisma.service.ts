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
      datasources: {
        db: {
          url: process.env.POSTGRES_URL,
        },
      },
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

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxAttempts = 3,
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        const msg = error?.message?.toLowerCase() || '';

        // Detecta erro de prepared statement
        if (
          msg.includes('prepared statement') &&
          (msg.includes('already exists') || msg.includes('does not exist'))
        ) {
          if (attempt < maxAttempts) {
            console.warn(
              `⚠️ Prepared statement error (attempt ${attempt}/${maxAttempts}):`,
              error.message,
            );

            // Força reconexão
            if (global.__prisma) {
              try {
                await global.__prisma.$disconnect();
              } catch (disconnectError) {
                console.warn('Disconnect warning:', disconnectError);
              }
              global.__prisma = undefined;
            }

            // Aguarda antes de tentar novamente
            await new Promise((resolve) => setTimeout(resolve, 100 * attempt));

            // Recria instância
            const newPrisma = new PrismaClient({
              log:
                process.env.NODE_ENV === 'development'
                  ? ['query', 'info', 'warn', 'error']
                  : ['warn', 'error'],
            });

            await newPrisma.$connect();
            global.__prisma = newPrisma;

            lastError = error;
            continue;
          }
        }

        throw error;
      }
    }

    throw lastError;
  }
}
