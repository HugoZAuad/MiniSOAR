import { describe, expect, it, vi } from 'vitest';
import { Threat } from '../../../../core/domain/entities/threat.entity';
import { ThreatEmbedFactory } from './threat-embed.factory';

describe('ThreatEmbedFactory', () => {
  it('deve criar embed CRÍTICO para ameaças de alto risco', () => {
    const threat = {
      isHighRisk: () => true,
      severity: 10,
      indicator: '1.1.1.1',
      type: 'IP',
      hybridScore: 10,
      recurrencyCount: 5,
      reputationScore: 100,
      country: 'BR',
      createdAt: new Date(),
    } as unknown as Threat;
    const result = ThreatEmbedFactory.create(threat);
    expect(result.color).toBe(0xe74c3c);
  });

  it('deve criar embed WARNING para severidade 4', () => {
    const threat = {
      isHighRisk: () => false,
      severity: 4,
      indicator: '1.1.1.1',
      type: 'IP',
      hybridScore: 4,
      recurrencyCount: 0,
      reputationScore: 0,
      country: 'BR',
      createdAt: new Date(),
    } as unknown as Threat;
    const result = ThreatEmbedFactory.create(threat);
    expect(result.color).toBe(0xe67e22);
  });

  it('deve criar embed INFO para ameaças de baixo risco (abaixo de 4)', () => {
    const threat = {
      isHighRisk: () => false,
      severity: 3,
      indicator: '1.1.1.1',
      type: 'IP',
      hybridScore: 3,
      recurrencyCount: 0,
      reputationScore: 0,
      country: 'BR',
      createdAt: new Date(),
    } as unknown as Threat;
    const result = ThreatEmbedFactory.create(threat);
    expect(result.color).toBe(0x3498db);
  });

  it('deve retornar embed padrão para tipo de ameaça desconhecido', () => {
    const unknownThreat = {
      type: 'UNKNOWN',
      indicator: '1.1.1.1',
      severity: 1,
      isHighRisk: vi.fn().mockReturnValue(false),
      createdAt: new Date(),
    } as unknown as Threat;

    const embed = ThreatEmbedFactory.create(unknownThreat);

    expect(embed).toBeDefined();
  });
});
