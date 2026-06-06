import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IngestThreatsUseCase } from './ingest-threats.use-case';

describe('IngestThreatsUseCase', () => {
  let useCase: IngestThreatsUseCase;
  const mockRegisterThreatUseCase = { execute: vi.fn() };

  beforeEach(() => {
    useCase = new IngestThreatsUseCase(mockRegisterThreatUseCase as any);
  });

  it('deve chamar o registerThreatUseCase para cada item do batch', async () => {
    const batch = [{ indicator: '1.1.1.1', type: 'IP', severity: 1 }];

    await useCase.execute(batch);

    expect(mockRegisterThreatUseCase.execute).toHaveBeenCalled();
  });
});
