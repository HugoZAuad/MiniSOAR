import { Module } from '@nestjs/common';
import { InfraModule } from '../infra/infra.module';

import { ContainThreatUseCase } from './application/use-cases/contain-threat.use-case';
import { GetThreatAnalyticsUseCase } from './application/use-cases/get-threat-analytics.use-case';
import { GetThreatHistoryUseCase } from './application/use-cases/get-threat-history.use-case';
import { GetThreatUseCase } from './application/use-cases/get-threat.use-case';
import { ListThreatsUseCase } from './application/use-cases/list-threats.use-case';
import { RegisterThreatUseCase } from './application/use-cases/register-threat.use-case';
import { ReleaseThreatUseCase } from './application/use-cases/release-threat.use-case';
import { IndicatorService } from './services/indicator.service';

@Module({
  imports: [InfraModule],
  providers: [
    RegisterThreatUseCase,
    GetThreatAnalyticsUseCase,
    ListThreatsUseCase,
    IndicatorService,
    ReleaseThreatUseCase,
    ContainThreatUseCase,
    GetThreatHistoryUseCase,
    GetThreatUseCase
  ],
  exports: [
    RegisterThreatUseCase,
    GetThreatAnalyticsUseCase,
    ListThreatsUseCase,
    ContainThreatUseCase,
    ReleaseThreatUseCase,
    GetThreatHistoryUseCase,
    GetThreatUseCase
  ],
})
export class UseCasesModule {}
