import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';
import { CoreModule } from '../../core/core.module';
import { ScanBatchCommand } from './scan-batch.command';
import { ScanBatchQuestions } from './scan-batch.questions';

@Module({
  imports: [CommandRunnerModule, CoreModule],
  providers: [ScanBatchCommand, ScanBatchQuestions],
})
export class CommandsModule {}
