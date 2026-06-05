import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { RegisterThreatUseCase } from './register-threat.use-case';

describe('RegisterThreatUseCase', () => {
  let sut: RegisterThreatUseCase;
  let repository: ThreatRepository;

  beforeEach(() => {
    repository = {
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn(),
    };
    sut = new RegisterThreatUseCase(repository);
  });

  it('should register a new threat', async () => {
    const data = {
      indicator: '192.168.1.1',
      type: 'IP',
      severity: 8,
    };

    const result = await sut.execute(
      data.indicator,
      data.type,
      data.severity,
      data,
    );

    expect(result.indicator).toBe(data.indicator);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
