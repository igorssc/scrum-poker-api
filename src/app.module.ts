import { Module } from '@nestjs/common';
import { HttpModule } from './infra/http/http.module';
import { PrismaModule } from './application/providers/prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
