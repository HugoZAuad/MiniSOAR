import { Inject, Injectable, Logger } from '@nestjs/common';
import { Threat } from '../../domain/entities/threat.entity';

import {
  EVENT_DISPATCHER_PORT,
  type EventDispatcher,
} from '../../domain/ports/event-dispatcher.port';

import {
  FIREWALL_PORT,
  type FirewallPort,
} from '../../domain/ports/firewall.port';

import { GEOIP_PORT, type GeoIpPort } from '../../domain/ports/geoip.port';

import {
  NOTIFICATION_PORT,
  type NotificationPort,
} from '../../domain/ports/notification.port';

import {
  THREAT_INTELLIGENCE_PORT,
  type ThreatIntelligencePort,
} from '../../domain/ports/threat-intelligence.port';

import type { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { THREAT_REPOSITORY_TOKEN } from '../../domain/repositories/threat-repository.token';

import { IndicatorService } from '../../services/indicator.service';
import { RegisterThreatInput } from '../interface/register-threat.input';

@Injectable()
export class RegisterThreatUseCase {
  private readonly logger = new Logger(RegisterThreatUseCase.name);

  constructor(
    @Inject(THREAT_REPOSITORY_TOKEN)
    private readonly threatRepository: ThreatRepository,

    @Inject(THREAT_INTELLIGENCE_PORT)
    private readonly threatIntelligence: ThreatIntelligencePort,

    @Inject(GEOIP_PORT)
    private readonly geoIp: GeoIpPort,

    @Inject(NOTIFICATION_PORT)
    private readonly notification: NotificationPort,

    @Inject(FIREWALL_PORT)
    private readonly firewall: FirewallPort,

    @Inject(EVENT_DISPATCHER_PORT)
    private readonly eventDispatcher: EventDispatcher,

    private readonly indicatorService: IndicatorService,
  ) {}

  async execute(data: RegisterThreatInput): Promise<Threat> {
    const normalizedType = data.type.toUpperCase();

    const threat = new Threat(data.indicator, normalizedType, data.severity);

    const [recurrencyCount, reputationScore, country] = await Promise.all([
      this.threatRepository.countByIndicator(data.indicator),
      this.threatIntelligence.getReputationScore(data.indicator),
      this.geoIp.getCountry(data.indicator),
    ]);

    threat.enrich({
      recurrencyCount,
      reputationScore,
      country,
    });

    await this.threatRepository.save(threat);

    this.eventDispatcher.dispatch('threat.created', threat);

    await this.dispatchNotification(threat);

    if (threat.isHighRisk()) {
      await this.dispatchMitigation(threat);
    }

    return threat;
  }

  private async dispatchNotification(threat: Threat): Promise<void> {
    try {
      await this.notification.sendAlert(threat);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `[SOAR] Falha ao enviar alerta para ${threat.indicator}: ${message}`,
      );
    }
  }

  private async dispatchMitigation(threat: Threat): Promise<void> {
    try {
      await this.firewall.block(
        threat.indicator,
        threat.type as 'IP' | 'DOMAIN' | 'HASH',
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `[SOAR ❌] Falha ao executar Resposta Ativa: ${message}`,
      );
    }
  }
}
