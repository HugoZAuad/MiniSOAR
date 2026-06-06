import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';
import { ScanBatchCommand } from './scan-batch.command';
import { ScanBatchQuestions } from './scan-batch.questions';

@Module({
  imports: [CommandRunnerModule],
  providers: [ScanBatchCommand, ScanBatchQuestions],
})
export class CommandsModule {}
