import { RegisterThreatUseCase } from './register-threat.use-case';
import { EventDispatcher } from '../../domain/ports/event-dispatcher.port';
import { vi, describe, it, expect } from 'vitest';
import { Threat } from '../../domain/entities/threat.entity';

describe('RegisterThreatUseCase Realtime Integration', () => {
  it('deve emitir evento "threat.created" ao registrar ameaça', async () => {
    const mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      countByIndicator: vi.fn().mockResolvedValue(0),
    };
    const mockIntel = { getReputationScore: vi.fn().mockResolvedValue(0) };
    const mockGeo = { getCountry: vi.fn().mockResolvedValue('BR') };
    const mockNotify = { sendAlert: vi.fn() };
    const mockFirewall = { block: vi.fn() };
    const mockEventDispatcher = {
      dispatch: vi.fn(),
    } as unknown as EventDispatcher;

    const sut = new RegisterThreatUseCase(
      mockRepo as any,
      mockIntel,
      mockGeo,
      mockNotify,
      mockFirewall,
      mockEventDispatcher,
    );

    await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 1 });

    expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(
      'threat.created',
      expect.any(Threat),
    );
  });
});
