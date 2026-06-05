import { ThreatLog as PrismaThreatLog } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { Threat } from '../../../../core/domain/entities/threat.entity';
import { PrismaThreatMapper } from './prisma-threat.mapper';

describe('PrismaThreatMapper', () => {
  const mockDate = new Date();
  const mockId = 'any-uuid';

  it('deve converter corretamente uma Entidade de Domínio para o modelo do Prisma', () => {
    const threat = new Threat('1.1.1.1', 'IP', 3, mockDate, mockId);
    threat.enrich({
      country: 'US',
      reputationScore: 85,
      recurrencyCount: 2,
    });

    const result = PrismaThreatMapper.toPrisma(threat);

    expect(result).toEqual({
      id: mockId,
      indicator: '1.1.1.1',
      type: 'IP',
      severity: 3,
      country: 'US',
      reputationScore: 85,
      recurrencyCount: 2,
      hybridScore: threat.hybridScore,
      createdAt: mockDate,
    });
  });

  it('deve converter corretamente o modelo do Prisma para uma Entidade de Domínio', () => {
    const raw: PrismaThreatLog = {
      id: mockId,
      indicator: '8.8.8.8',
      type: 'IP',
      severity: 2,
      country: 'BR',
      reputationScore: 10,
      recurrencyCount: 0,
      hybridScore: 12.0,
      createdAt: mockDate,
    };

    const result = PrismaThreatMapper.toDomain(raw);

    expect(result).toBeInstanceOf(Threat);
    expect(result.id).toBe(mockId);
    expect(result.indicator).toBe('8.8.8.8');
    expect(result.country).toBe('BR');
    expect(result.reputationScore).toBe(10);
    expect(result.recurrencyCount).toBe(0);
  });

  it('deve mapear corretamente para nulo os campos opcionais se a entidade não estiver enriquecida', () => {
    const threat = new Threat('1.1.1.1', 'IP', 1, mockDate, mockId);

    const result = PrismaThreatMapper.toPrisma(threat);

    expect(result.country).toBeNull();
    expect(result.reputationScore).toBeNull();
  });

  it('deve converter do Prisma para o Dominio tratando campos nulos como undefined', () => {
    const raw: PrismaThreatLog = {
      id: mockId,
      indicator: '8.8.8.8',
      type: 'IP',
      severity: 2,
      country: null,
      reputationScore: null,
      recurrencyCount: 0,
      hybridScore: 2.0,
      createdAt: mockDate,
    };

    const result = PrismaThreatMapper.toDomain(raw);

    expect(result.country).toBeUndefined();
    expect(result.reputationScore).toBeUndefined();
  });
});
