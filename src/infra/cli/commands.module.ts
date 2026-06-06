import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { ScanBatchCommand } from './scan-batch.command';
import { ScanBatchQuestions } from './scan-batch.questions';

@Module({
  imports: [CoreModule],
  providers: [ScanBatchCommand, ScanBatchQuestions],
})
export class CommandsModule {}
