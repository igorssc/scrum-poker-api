import { PrismaModule } from '@/application/providers/prisma/prisma.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
})
export class HttpModule {}
