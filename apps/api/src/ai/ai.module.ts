import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { AiController } from './ai.controller';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AiController],
  providers: [AiOrchestratorService],
  exports: [AiOrchestratorService],
})
export class AiModule {}
