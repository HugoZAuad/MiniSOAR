import { ThreatLog as PrismaThreatLog } from '@prisma/client';
import { Threat } from '../../../../core/domain/entities/threat.entity';

export class PrismaThreatMapper {
  static toDomain(raw: PrismaThreatLog): Threat {
    const threat = new Threat(
      raw.indicator,
      raw.type,
      raw.severity,
      raw.createdAt,
      raw.id,
      raw.containment,
    );

    threat.enrich({
      country: raw.country ?? undefined,
      reputationScore: raw.reputationScore ?? undefined,
      recurrencyCount: raw.recurrencyCount,
    });

    return threat;
  }

  static toPrisma(threat: Threat): PrismaThreatLog {
    return {
      id: threat.id,
      indicator: threat.indicator,
      type: threat.type,
      severity: threat.severity,
      containment: threat.containment,

      country: threat.country ?? null,
      reputationScore: threat.reputationScore ?? null,
      recurrencyCount: threat.recurrencyCount,

      hybridScore: threat.hybridScore,
      riskScore: threat.riskScore,

      createdAt: threat.createdAt,
    };
  }
}