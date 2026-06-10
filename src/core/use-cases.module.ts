import { Module } from '@nestjs/common';
import { InfraModule } from '../infra/infra.module';

import { GetThreatAnalyticsUseCase } from './application/use-cases/get-threat-analytics.use-case';
import { ListThreatsUseCase } from './application/use-cases/list-threats.use-case';
import { RegisterThreatUseCase } from './application/use-cases/register-threat.use-case';
import { IndicatorService } from './services/indicator.service';

@Module({
  imports: [InfraModule],
  providers: [
    RegisterThreatUseCase,
    GetThreatAnalyticsUseCase,
    ListThreatsUseCase,
    IndicatorService,
  ],
  exports: [
    RegisterThreatUseCase,
    GetThreatAnalyticsUseCase,
    ListThreatsUseCase,
  ],
})
export class UseCasesModule {}
