import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { GetThreatAnalyticsUseCase } from './get-threat-analytics.use-case';

describe('GetThreatAnalyticsUseCase', () => {
  const repositoryMock = { getAnalytics: vi.fn() };
  let sut: GetThreatAnalyticsUseCase;

  beforeEach(() => {
    sut = new GetThreatAnalyticsUseCase(
      repositoryMock as unknown as ThreatRepository,
    );
  });

  it('deve retornar os dados de analytics do repositório', async () => {
    const mockData = {
      totalThreats: 10,
      bySeverity: [{ level: 3, count: 5 }],
      topIndicators: [{ indicator: '1.1.1.1', count: 2 }],
    };

    vi.mocked(repositoryMock.getAnalytics).mockResolvedValue(mockData);

    const result = await sut.execute();

    expect(result).toEqual(mockData);
    expect(repositoryMock.getAnalytics).toHaveBeenCalled();
  });
});
