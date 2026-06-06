import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { ScanBatchCommand } from './scan-batch.command';

@Module({
  imports: [CoreModule],
  providers: [ScanBatchCommand],
})
export class CommandsModule {}
