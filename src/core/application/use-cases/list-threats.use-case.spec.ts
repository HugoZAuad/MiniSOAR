import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { FilterThreatsDto } from '../interface/filter-threats.dto';
import { PaginatedThreatsDto } from '../interface/paginated-threats.dto';
import { ListThreatsUseCase } from './list-threats.use-case';

describe('ListThreatsUseCase', () => {
  let useCase: ListThreatsUseCase;
  let mockRepository: ThreatRepository;

  beforeEach(() => {
    mockRepository = {
      findAllPaginated: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      findById: vi.fn(),
      countByIndicator: vi.fn(),
    } as unknown as ThreatRepository;

    useCase = new ListThreatsUseCase(mockRepository);
  });

  it('deve chamar o repositório com paginação padrão', async () => {
    const mockResult: PaginatedThreatsDto = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    vi.mocked(mockRepository.findAllPaginated).mockResolvedValue(mockResult);

    const params: FilterThreatsDto = { page: 1, limit: 10 };

    const result = await useCase.execute(params);

    expect(mockRepository.findAllPaginated).toHaveBeenCalledTimes(1);
    expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(params);
    expect(result).toEqual(mockResult);
  });

  it('deve lidar com erros do repositório', async () => {
    vi.mocked(mockRepository.findAllPaginated).mockRejectedValue(
      new Error('Erro no Banco de Dados'),
    );

    const params: FilterThreatsDto = { page: 1, limit: 10 };

    await expect(useCase.execute(params)).rejects.toThrow(
      'Erro no Banco de Dados',
    );
  });
});
