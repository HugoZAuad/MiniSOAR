import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { PaginatedThreatsDto } from '../interface/paginated-threats.dto';
import { ListThreatsUseCase } from './list-threats.use-case';

describe('ListThreatsUseCase', () => {
  let useCase: ListThreatsUseCase;

  const mockRepository = {
    findAllPaginated: vi.fn(),
  };

  beforeEach(() => {
    useCase = new ListThreatsUseCase(
      mockRepository as unknown as ThreatRepository,
    );
  });

  it('deve chamar o repositório com paginação padrão', async () => {
    const mockResult: PaginatedThreatsDto = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    vi.mocked(mockRepository.findAllPaginated).mockResolvedValue(mockResult);

    const params = { page: 1, limit: 10 };
    const result = await useCase.execute(params);

    expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(params);
    expect(result).toEqual(mockResult);
  });

  it('deve aplicar filtros de severidade e indicador corretamente', async () => {
    const mockResult: PaginatedThreatsDto = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    vi.mocked(mockRepository.findAllPaginated).mockResolvedValue(mockResult);

    const params = { page: 1, limit: 10, indicator: '1.1.1.1', severity: 5 };
    await useCase.execute(params);

    expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(params);
  });
});
