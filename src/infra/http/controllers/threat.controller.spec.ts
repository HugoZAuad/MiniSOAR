import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FilterThreatsDto } from '../../../core/application/interface/filter-threats.dto';
import { ListThreatsUseCase } from '../../../core/application/use-cases/list-threats.use-case';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';
import { RegisterThreatDto } from '../../../infra/http/dto/register-threat.dto';
import { ThreatController } from './threat.controller';

describe('ThreatController', () => {
  let controller: ThreatController;

  const registerUseCaseMock = { execute: vi.fn() };
  const listUseCaseMock = { execute: vi.fn() };

  beforeEach(async () => {
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

  describe('list', () => {
    it('deve chamar o useCase com os filtros corretos', async () => {
      const filter: FilterThreatsDto = { page: 1, limit: 10 };
      listUseCaseMock.execute.mockResolvedValue({ data: [] });

      await controller.list(filter);

      expect(listUseCaseMock.execute).toHaveBeenCalledWith(filter);
    });
  });

  describe('register', () => {
    it('deve chamar o useCase com os dados corretos', async () => {
      const body: RegisterThreatDto = {
        indicator: '1.1.1.1',
        type: 'IP',
        severity: 1,
      };
      registerUseCaseMock.execute.mockResolvedValue({ id: '1' });

      await controller.register(body);

      expect(registerUseCaseMock.execute).toHaveBeenCalledWith(body);
    });
  });
});
