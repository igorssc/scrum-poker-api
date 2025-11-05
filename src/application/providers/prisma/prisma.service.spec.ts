import { Test } from '@nestjs/testing';
import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('PrismaService Singleton', () => {
  let service1: PrismaService;
  let service2: PrismaService;

  beforeEach(async () => {
    const module1 = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    const module2 = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service1 = module1.get<PrismaService>(PrismaService);
    service2 = module2.get<PrismaService>(PrismaService);
  });

  it('should reuse the same PrismaClient instance', () => {
    // Verifica se ambas as instâncias do service apontam para o mesmo cliente Prisma
    expect(service1).toBe(service2);
  });

  it('should have the same internal PrismaClient instance', () => {
    // Verifica se a instância global foi criada
    expect(global.__prisma).toBeDefined();

    // Verifica se ambos os services usam a mesma instância global
    expect(service1).toBe(global.__prisma);
    expect(service2).toBe(global.__prisma);
  });
});
