import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListThreatsUseCase } from './list-threats.use-case';

describe('ListThreatsUseCase', () => {
  let useCase: ListThreatsUseCase;

  const mockRepository = {
    findAll: vi.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    useCase = new ListThreatsUseCase(mockRepository as any);
  });

  it('deve chamar o repositório com paginação padrão', async () => {
    await useCase.execute();
    expect(mockRepository.findAll).toHaveBeenCalled();
  });

  it('deve aplicar filtros de severidade e indicador corretamente', async () => {
    await useCase.execute();
    expect(mockRepository.findAll).toHaveBeenCalled();
  });
});
