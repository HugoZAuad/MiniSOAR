import { Module } from '@nestjs/common';
import { IndicatorService } from '../core/services/indicator.service';
import { EventEmitterAdapter } from '../infra/adapters/event/event-emitter.adapter';
import { FetchGeoIpAdapter } from '../infra/adapters/geoip/fetch-geoip.adapter';
import { PrismaThreatRepository } from '../infra/database/prisma/repositories/prisma-threat.repository';
import { LocalFirewallService } from '../infra/providers/firewall/local-firewall.service';
import { DiscordService } from '../infra/providers/notification/discord.service';
import { RegisterThreatUseCase } from './application/use-cases/register-threat.use-case';

export const THREAT_REPOSITORY = 'THREAT_REPOSITORY_TOKEN';
export const THREAT_INTEL_PORT = 'THREAT_INTEL_PORT';
export const GEO_IP_PORT = 'GEO_IP_PORT';
export const NOTIFICATION_PORT = 'NOTIFICATION_PORT';
export const FIREWALL_PORT = 'FIREWALL_PORT';
export const EVENT_DISPATCHER_PORT = 'EVENT_DISPATCHER_PORT';

@Module({
  providers: [
    RegisterThreatUseCase,
    IndicatorService,

    { provide: THREAT_REPOSITORY, useClass: PrismaThreatRepository },
    { provide: THREAT_INTEL_PORT, useClass: IndicatorService },
    { provide: GEO_IP_PORT, useClass: FetchGeoIpAdapter },
    { provide: NOTIFICATION_PORT, useClass: DiscordService },
    { provide: FIREWALL_PORT, useClass: LocalFirewallService },
    { provide: EVENT_DISPATCHER_PORT, useClass: EventEmitterAdapter },
  ],
  exports: [RegisterThreatUseCase],
})
export class CoreModule {}
