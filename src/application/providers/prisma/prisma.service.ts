import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
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
  }
  return prisma;
}

@Injectable()
export class PrismaService {
  private readonly client: PrismaClient;

  constructor() {
    this.client = getPrismaClient();
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
        if (
          msg.includes('prepared statement') &&
          msg.includes('already exists') &&
          attempt < maxAttempts
        ) {
          // Força reconexão do PrismaClient
          if (prisma) {
            await prisma.$disconnect();
            prisma = undefined;
          }
          await new Promise((res) => setTimeout(res, 100 * attempt));
          prisma = getPrismaClient();
          lastError = error;
          continue;
        }
        throw error;
      }
    }
    throw lastError;
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
  get vote() {
    return this.client.vote;
  }
  get votingRound() {
    return this.client.votingRound;
  }
  get voteDetail() {
    return this.client.voteDetail;
  }

  async $connect() {
    await this.client.$connect();
  }
  async $disconnect() {
    await this.client.$disconnect();
  }
}
