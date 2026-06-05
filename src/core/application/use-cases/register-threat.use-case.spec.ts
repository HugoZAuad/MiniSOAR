import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Threat } from '../../domain/entities/threat.entity';
import type { GeoIpPort } from '../../domain/ports/geoip.port';
import type { ThreatIntelligencePort } from '../../domain/ports/threat-intelligence.port';
import type { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { RegisterThreatUseCase } from './register-threat.use-case';

describe('RegisterThreatUseCase', () => {
  let sut: RegisterThreatUseCase;

  const mockSave = vi.fn();
  const mockFindAll = vi.fn();
  const mockCountByIndicator = vi.fn();
  const mockGetReputationScore = vi.fn();
  const mockGetCountry = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    mockSave.mockResolvedValue(undefined);
    mockCountByIndicator.mockResolvedValue(0);
    mockGetReputationScore.mockResolvedValue(0);
    mockGetCountry.mockResolvedValue(undefined);

    const repositoryMock: ThreatRepository = {
      save: mockSave,
      findAll: mockFindAll,
      countByIndicator: mockCountByIndicator,
    };

    const intelligencePortMock: ThreatIntelligencePort = {
      getReputationScore: mockGetReputationScore,
    };

    const geoIpPortMock: GeoIpPort = {
      getCountry: mockGetCountry,
    };

    sut = new RegisterThreatUseCase(
      repositoryMock,
      intelligencePortMock,
      geoIpPortMock,
    );
  });

  it('deve registrar uma nova ameaça e enriquecê-la com sucesso com dados externos', async () => {
    mockCountByIndicator.mockResolvedValue(3);
    mockGetReputationScore.mockResolvedValue(75);
    mockGetCountry.mockResolvedValue('BR');

    const data = {
      indicator: '192.168.1.1',
      type: 'IP',
      severity: 5,
    };

    const result = await sut.execute(data);

    expect(result.indicator).toBe(data.indicator);
    expect(result.type).toBe(data.type);
    expect(result.severity).toBe(data.severity);
    expect(result.id).toBeDefined();

    expect(result.country).toBe('BR');
    expect(result.reputationScore).toBe(75);
    expect(result.recurrencyCount).toBe(3);

    expect(result.hybridScore).toBe(8.8);
    expect(result.isHighRisk()).toBe(true);

    expect(mockCountByIndicator).toHaveBeenCalledWith(data.indicator);
    expect(mockGetReputationScore).toHaveBeenCalledWith(data.indicator);
    expect(mockGetCountry).toHaveBeenCalledWith(data.indicator);

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(expect.any(Threat));
  });

  it('deve registrar a ameaça utilizando valores padrão caso os enriquecimentos externos falhem', async () => {
    mockCountByIndicator.mockResolvedValue(0);
    mockGetReputationScore.mockResolvedValue(0);
    mockGetCountry.mockResolvedValue(undefined);

    const data = {
      indicator: '1.1.1.1',
      type: 'IP',
      severity: 3,
    };

    const result = await sut.execute(data);

    expect(result.indicator).toBe(data.indicator);
    expect(result.country).toBeUndefined();
    expect(result.reputationScore).toBe(0);
    expect(result.recurrencyCount).toBe(0);

    expect(result.hybridScore).toBe(3.0);
    expect(result.isHighRisk()).toBe(false);

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(expect.any(Threat));
  });
});
