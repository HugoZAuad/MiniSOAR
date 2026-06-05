import { Module } from '@nestjs/common';
import { RegisterThreatUseCase } from '../../core/application/use-cases/register-threat.use-case';
import { GEOIP_PORT } from '../../core/domain/ports/geoip.port';
import { THREAT_INTELLIGENCE_PORT } from '../../core/domain/ports/threat-intelligence.port';
import { THREAT_REPOSITORY_TOKEN } from '../../core/domain/repositories/threat-repository.token';
import { FetchGeoIpAdapter } from '../../infra/adapters/geoip/fetch-geoip.adapter';
import { AbuseIpDbAdapter } from '../../infra/adapters/intelligence/abuseipdb.adapter';
import { ScanBatchCommand } from '../../infra/cli/scan-batch.command';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { PrismaThreatRepository } from '../../infra/database/prisma/repositories/prisma-threat.repository';
import { ThreatController } from '../../infra/http/controllers/threat.controller';
import { InfraModule } from '../infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [ThreatController],
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
    RegisterThreatUseCase,
    ScanBatchCommand,
  ],
  exports: [RegisterThreatUseCase],
})
export class ThreatModule {}
