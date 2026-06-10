import { Test, TestingModule } from '@nestjs/testing';
import { Threat } from '../../../core/domain/entities/threat.entity';
import { DynamicPlaybookListener } from './dynamic-playbook.listener';

describe('DynamicPlaybookListener', () => {
  let listener: DynamicPlaybookListener;
  let spyWarn: any;
  let spyLog: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynamicPlaybookListener],
    }).compile();

    listener = module.get<DynamicPlaybookListener>(DynamicPlaybookListener);

    spyWarn = vi
      .spyOn(listener['logger'], 'warn')
      .mockImplementation(() => undefined);
    spyLog = vi
      .spyOn(listener['logger'], 'log')
      .mockImplementation(() => undefined);
  });

  it('deve disparar ação de contenção se a severidade for crítica (>= 4)', () => {
    const threat = { indicator: '1.1.1.1', severity: 5 } as Threat;
    listener.handleThreatDetected(threat);

    expect(spyWarn).toHaveBeenCalledWith(
      expect.stringContaining('[PLAYBOOK AUTOMÁTICO]'),
    );
  });

  it('deve logar mensagem simples se a severidade for baixa (< 4)', () => {
    const threat = { indicator: '1.1.1.1', severity: 3 } as Threat;
    listener.handleThreatDetected(threat);

    expect(spyLog).toHaveBeenCalledWith(
      expect.stringContaining('Ameaça de baixa severidade'),
    );
    expect(spyWarn).not.toHaveBeenCalled();
  });

  it('deve abortar silenciosamente se o payload do evento for inválido', () => {
    listener.handleThreatDetected(null as unknown as Threat);

    listener.handleThreatDetected({ severity: 1 } as unknown as Threat);

    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  });
});
