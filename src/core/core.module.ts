import { Module } from '@nestjs/common';
import { InfraModule } from '../infra/infra.module';

import { RegisterThreatUseCase } from './application/use-cases/register-threat.use-case';
import { IndicatorService } from './services/indicator.service';

@Module({
  imports: [InfraModule],
  providers: [RegisterThreatUseCase, IndicatorService],
  exports: [RegisterThreatUseCase, IndicatorService],
})
export class CoreModule {}
