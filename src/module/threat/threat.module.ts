import { Module } from '@nestjs/common';
import { UseCasesModule } from '../../core/use-cases.module';
import { AnalyticsController } from '../../infra/http/controllers/analytics.controller';
import { ThreatController } from '../../infra/http/controllers/threat.controller';
import { InfraModule } from '../../infra/infra.module';

@Module({
  imports: [InfraModule, UseCasesModule],
  controllers: [ThreatController, AnalyticsController],
})
export class ThreatModule {}
