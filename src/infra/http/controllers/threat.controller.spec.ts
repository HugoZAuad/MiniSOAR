import { Test, TestingModule } from '@nestjs/testing';
import { ThreatController } from './threat.controller';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';
import { Threat } from '../../../core/domain/entities/threat.entity'; // Import necessário
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('ThreatController', () => {
  let controller: ThreatController;
  let useCaseMock: RegisterThreatUseCase;

  beforeEach(async () => {
    // Inicializamos o mock com o método execute tipado
    useCaseMock = { execute: vi.fn() } as unknown as RegisterThreatUseCase;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThreatController],
      providers: [
        {
          provide: RegisterThreatUseCase,
          useValue: useCaseMock,
        },
      ],
    }).compile();

    controller = module.get<ThreatController>(ThreatController);
  });

  it('deve chamar o use case corretamente', async () => {
    // 1. Criamos um objeto que satisfaça a interface da entidade Threat
    const mockThreat = {
      id: 'uuid',
      indicator: '1.1.1.1',
      type: 'IP',
      severity: 5,
    } as unknown as Threat;

    // 2. Mock do execute retornando a entidade Threat completa
    const spy = vi.mocked(useCaseMock.execute).mockResolvedValue(mockThreat);

    // 3. Chamamos o método correto do seu controller (verifique se é 'register' ou 'registerThreat')
    await controller.register({
      indicator: '1.1.1.1',
      type: 'IP',
      severity: 5,
    });

    // 4. Verificação
    expect(spy).toHaveBeenCalledWith({
      indicator: '1.1.1.1',
      type: 'IP',
      severity: 5,
    });
  });
});
