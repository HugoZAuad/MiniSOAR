import { Module } from '@nestjs/common';
import { EVENT_DISPATCHER_PORT } from 'src/core/domain/ports/event-dispatcher.port';
import { EventEmitterAdapter } from 'src/infra/adapters/event/event-emitter.adapter';
import { ThreatGateway } from 'src/infra/gateways/threat.gateway';
import { GetThreatAnalyticsUseCase } from '../../core/application/use-cases/get-threat-analytics.use-case'; // NOVO
import { RegisterThreatUseCase } from '../../core/application/use-cases/register-threat.use-case';
import { GEOIP_PORT } from '../../core/domain/ports/geoip.port';
import { THREAT_INTELLIGENCE_PORT } from '../../core/domain/ports/threat-intelligence.port';
import { THREAT_REPOSITORY_TOKEN } from '../../core/domain/repositories/threat-repository.token';
import { FetchGeoIpAdapter } from '../../infra/adapters/geoip/fetch-geoip.adapter';
import { AbuseIpDbAdapter } from '../../infra/adapters/intelligence/abuseipdb.adapter';
import { ScanBatchCommand } from '../../infra/cli/scan-batch.command';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { PrismaThreatRepository } from '../../infra/database/prisma/repositories/prisma-threat.repository';
import { AnalyticsController } from '../../infra/http/controllers/analytics.controller';
import { ThreatController } from '../../infra/http/controllers/threat.controller';
import { InfraModule } from '../infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [ThreatController, AnalyticsController],
  providers: [
    PrismaService,
    {
      provide: THREAT_REPOSITORY_TOKEN,
      useClass: PrismaThreatRepository,
    },
    {
      provide: GEOIP_PORT,
      useClass: FetchGeoIpAdapter,
    },
    {
      provide: THREAT_INTELLIGENCE_PORT,
      useClass: AbuseIpDbAdapter,
    },
    {
      provide: EVENT_DISPATCHER_PORT,
      useClass: EventEmitterAdapter,
    },
    RegisterThreatUseCase,
    GetThreatAnalyticsUseCase,
    ScanBatchCommand,
    ThreatGateway,
  ],
  exports: [RegisterThreatUseCase, GetThreatAnalyticsUseCase],
})
export class ThreatModule {}
