import { Module } from '@nestjs/common';

import { RegisterThreatUseCase } from './application/use-cases/register-threat.use-case';
import { IndicatorService } from './services/indicator.service';

@Module({
  providers: [RegisterThreatUseCase, IndicatorService],
  exports: [RegisterThreatUseCase, IndicatorService],
})
export class CoreModule {}
