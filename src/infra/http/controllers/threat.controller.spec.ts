import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';
import { ThreatController } from './threat.controller';

describe('ThreatController', () => {
  let controller: ThreatController;

  const mockRegisterThreatUseCase = {
    execute: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThreatController],
      providers: [
        {
          provide: RegisterThreatUseCase,
          useValue: mockRegisterThreatUseCase,
        },
      ],
    }).compile();

    controller = module.get<ThreatController>(ThreatController);
  });

  it('deve ser definido corretamente com suas dependências', () => {
    expect(controller).toBeDefined();
  });

  it('deve registrar uma ameaça com sucesso e retornar a estrutura correta de resposta HTTP', async () => {
    const payload = {
      indicator: '45.123.4.5',
      type: 'IP',
      severity: 4,
    };

    const mockThreatCreated = {
      id: 'generated-secure-uuid',
      indicator: payload.indicator,
    };

    mockRegisterThreatUseCase.execute.mockResolvedValue(mockThreatCreated);

    const result = await controller.register(payload);

    expect(result).toEqual({
      message: 'Threat registered successfully',
      id: 'generated-secure-uuid',
    });

    expect(mockRegisterThreatUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockRegisterThreatUseCase.execute).toHaveBeenCalledWith(payload);
  });
});
