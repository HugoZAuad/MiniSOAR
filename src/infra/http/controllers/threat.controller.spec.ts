import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';
import { ApiKeyGuard } from '../../guards/api-key.guard';
import { ThreatController } from './threat.controller';

describe('ThreatController', () => {
  let controller: ThreatController;

  const mockUseCase = {
    execute: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [ThreatController],
      providers: [
        {
          provide: RegisterThreatUseCase,
          useValue: mockUseCase,
        },
        ApiKeyGuard,
      ],
    }).compile();

    controller = module.get<ThreatController>(ThreatController);
  });

  it('deve ser definido corretamente', () => {
    expect(controller).toBeDefined();
  });

  it('deve registrar uma ameaça com sucesso', async () => {
    const dto = { indicator: '1.1.1.1', type: 'IP' as const, severity: 5 };
    mockUseCase.execute.mockResolvedValue({ id: 'any_id', ...dto });

    const result = await controller.register(dto);

    expect(result).toHaveProperty('id');
    expect(mockUseCase.execute).toHaveBeenCalledWith(dto);
  });
});
