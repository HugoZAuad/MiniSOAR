import { Module } from '@nestjs/common';
import { IndicatorService } from '../../core/services/indicator.service';
import { UseCasesModule } from '../../core/use-cases.module';
import { ScanBatchCommand } from './scan-batch.command';
import { ScanBatchQuestions } from './scan-batch.questions';

@Module({
  imports: [UseCasesModule],
  providers: [ScanBatchCommand, ScanBatchQuestions, IndicatorService],
})
export class CommandsModule {}
