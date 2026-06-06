import { Module } from '@nestjs/common';
import { IndicatorService } from '../core/services/indicator.service';
import { EventEmitterAdapter } from '../infra/adapters/event/event-emitter.adapter';
import { FetchGeoIpAdapter } from '../infra/adapters/geoip/fetch-geoip.adapter';
import { DatabaseModule } from '../infra/database/database.module';
import { PrismaThreatRepository } from '../infra/database/prisma/repositories/prisma-threat.repository';
import { LocalFirewallService } from '../infra/providers/firewall/local-firewall.service';
import { DiscordService } from '../infra/providers/notification/discord.service';
import { RegisterThreatUseCase } from './application/use-cases/register-threat.use-case';
import { EVENT_DISPATCHER_PORT } from './domain/ports/event-dispatcher.port';
import { FIREWALL_PORT } from './domain/ports/firewall.port';
import { GEOIP_PORT } from './domain/ports/geoip.port';
import { NOTIFICATION_PORT } from './domain/ports/notification.port';
import { THREAT_INTELLIGENCE_PORT } from './domain/ports/threat-intelligence.port';
import { THREAT_REPOSITORY_TOKEN } from './domain/repositories/threat-repository.token';

@Module({
  imports: [DatabaseModule],
  providers: [
    RegisterThreatUseCase,
    IndicatorService,
    { provide: THREAT_REPOSITORY_TOKEN, useClass: PrismaThreatRepository },
    { provide: THREAT_INTELLIGENCE_PORT, useClass: IndicatorService },
    { provide: GEOIP_PORT, useClass: FetchGeoIpAdapter },
    { provide: NOTIFICATION_PORT, useClass: DiscordService },
    { provide: FIREWALL_PORT, useClass: LocalFirewallService },
    { provide: EVENT_DISPATCHER_PORT, useClass: EventEmitterAdapter },
  ],
  exports: [RegisterThreatUseCase],
})
export class CoreModule {}
