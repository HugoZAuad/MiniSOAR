import { Inject, Injectable } from '@nestjs/common';
import { Threat } from '../../domain/entities/threat.entity';
import type { GeoIpPort } from '../../domain/ports/geoip.port';
import { GEOIP_PORT } from '../../domain/ports/geoip.port';
import type { ThreatIntelligencePort } from '../../domain/ports/threat-intelligence.port';
import { THREAT_INTELLIGENCE_PORT } from '../../domain/ports/threat-intelligence.port';
import type { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { THREAT_REPOSITORY_TOKEN } from '../../domain/repositories/threat-repository.token';
import { RegisterThreatInput } from '../interface/register-threat.input';

@Injectable()
export class RegisterThreatUseCase {
  constructor(
    @Inject(THREAT_REPOSITORY_TOKEN)
    private readonly threatRepository: ThreatRepository,

    @Inject(THREAT_INTELLIGENCE_PORT)
    private readonly threatIntelligence: ThreatIntelligencePort,

    @Inject(GEOIP_PORT)
    private readonly geoIp: GeoIpPort,
  ) {}

  async execute(data: RegisterThreatInput): Promise<Threat> {
    const threat = new Threat(data.indicator, data.type, data.severity);

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

    return threat;
  }
}
