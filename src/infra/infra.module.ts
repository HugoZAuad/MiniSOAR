import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EVENT_DISPATCHER_PORT } from '../core/domain/ports/event-dispatcher.port';
import { FIREWALL_PORT } from '../core/domain/ports/firewall.port';
import { GEOIP_PORT } from '../core/domain/ports/geoip.port';
import { NOTIFICATION_PORT } from '../core/domain/ports/notification.port';
import { THREAT_INTELLIGENCE_PORT } from '../core/domain/ports/threat-intelligence.port';
import { THREAT_REPOSITORY_TOKEN } from '../core/domain/repositories/threat-repository.token';
import { LocalFirewallService } from '../infra/providers/firewall/local-firewall.service';
import { DiscordService } from '../infra/providers/notification/discord.service';
import { EventEmitterAdapter } from './adapters/event/event-emitter.adapter';
import { FetchGeoIpAdapter } from './adapters/geoip/fetch-geoip.adapter';
import { AbuseIpDbAdapter } from './adapters/intelligence/abuseipdb.adapter';
import { PrismaService } from './database/prisma/prisma.service';
import { PrismaThreatRepository } from './database/prisma/repositories/prisma-threat.repository';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    { provide: NOTIFICATION_PORT, useClass: DiscordService },
    { provide: FIREWALL_PORT, useClass: LocalFirewallService },
    { provide: THREAT_REPOSITORY_TOKEN, useClass: PrismaThreatRepository },
    { provide: THREAT_INTELLIGENCE_PORT, useClass: AbuseIpDbAdapter },
    { provide: GEOIP_PORT, useClass: FetchGeoIpAdapter },
    { provide: EVENT_DISPATCHER_PORT, useClass: EventEmitterAdapter },
  ],
  exports: [
    NOTIFICATION_PORT,
    FIREWALL_PORT,
    THREAT_REPOSITORY_TOKEN,
    THREAT_INTELLIGENCE_PORT,
    GEOIP_PORT,
    EVENT_DISPATCHER_PORT,
  ],
})
export class InfraModule {}
