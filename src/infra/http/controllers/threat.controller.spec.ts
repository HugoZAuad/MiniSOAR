import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FilterThreatsDto } from '../../../core/application/interface/filter-threats.dto';
import { PaginatedThreatsDto } from '../../../core/application/interface/paginated-threats.dto';
import { ListThreatsUseCase } from '../../../core/application/use-cases/list-threats.use-case';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';
import { Threat } from '../../../core/domain/entities/threat.entity';
import { ThreatController } from './threat.controller';

describe('ThreatController', () => {
  let controller: ThreatController;
  let registerUseCaseMock: RegisterThreatUseCase;
  let listUseCaseMock: ListThreatsUseCase;

  beforeEach(async () => {
    registerUseCaseMock = {
      execute: vi.fn(),
    } as unknown as RegisterThreatUseCase;
    listUseCaseMock = { execute: vi.fn() } as unknown as ListThreatsUseCase;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThreatController],
      providers: [
        {
          provide: RegisterThreatUseCase,
          useValue: registerUseCaseMock,
        },
        {
          provide: ListThreatsUseCase,
          useValue: listUseCaseMock,
        },
      ],
    }).compile();

    controller = module.get<ThreatController>(ThreatController);
  });

  describe('register', () => {
    it('deve registrar uma ameaça com sucesso', async () => {
      const mockThreat = {
        id: 'uuid',
        indicator: '1.1.1.1',
        type: 'IP',
        severity: 5,
      } as unknown as Threat;

      vi.mocked(registerUseCaseMock.execute).mockResolvedValue(mockThreat);

      const result = await controller.register({
        indicator: '1.1.1.1',
        type: 'IP',
        severity: 5,
      });

      expect(registerUseCaseMock.execute).toHaveBeenCalledWith({
        indicator: '1.1.1.1',
        type: 'IP',
        severity: 5,
      });
      expect(result).toEqual(mockThreat);
    });

    it('deve propagar erro se o registro falhar (cobertura de branch)', async () => {
      vi.mocked(registerUseCaseMock.execute).mockRejectedValue(
        new Error('Erro interno'),
      );

      await expect(
        controller.register({
          indicator: '1.1.1.1',
          type: 'IP',
          severity: 5,
        }),
      ).rejects.toThrow('Erro interno');
    });
  });

  describe('list', () => {
    it('deve listar as ameaças corretamente', async () => {
      const mockResult: PaginatedThreatsDto = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      vi.mocked(listUseCaseMock.execute).mockResolvedValue(mockResult);

      const filter: FilterThreatsDto = { page: 1, limit: 10 };
      const result = await controller.list(filter);

      expect(listUseCaseMock.execute).toHaveBeenCalledWith(filter);
      expect(result).toEqual(mockResult);
    });
  });
});
