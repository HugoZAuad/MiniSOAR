import { describe, expect, it, vi } from 'vitest';
import { Threat } from '../../domain/entities/threat.entity';
import type { EventDispatcher } from '../../domain/ports/event-dispatcher.port';
import type { FirewallPort } from '../../domain/ports/firewall.port';
import type { GeoIpPort } from '../../domain/ports/geoip.port';
import type { NotificationPort } from '../../domain/ports/notification.port';
import type { ThreatIntelligencePort } from '../../domain/ports/threat-intelligence.port';
import type { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { RegisterThreatUseCase } from './register-threat.use-case';

describe('RegisterThreatUseCase Realtime Integration', () => {
  it('deve emitir evento "threat.created" ao registrar ameaça', async () => {
    const mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      countByIndicator: vi.fn().mockResolvedValue(0),
    } as unknown as ThreatRepository;

    const mockIntel = {
      getReputationScore: vi.fn().mockResolvedValue(0),
      checkIp: vi.fn(),
    } as unknown as ThreatIntelligencePort;

    const mockGeo = {
      getCountry: vi.fn().mockResolvedValue('BR'),
    } as unknown as GeoIpPort;
    const mockNotify = { sendAlert: vi.fn() } as unknown as NotificationPort;
    const mockFirewall = { block: vi.fn() } as unknown as FirewallPort;

    const mockEventDispatcher = {
      dispatch: vi.fn(),
    } as unknown as EventDispatcher;

    const sut = new RegisterThreatUseCase(
      mockRepo,
      mockIntel,
      mockGeo,
      mockNotify,
      mockFirewall,
      mockEventDispatcher,
    );

    await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 1 });

    expect(vi.mocked(mockEventDispatcher.dispatch)).toHaveBeenCalledWith(
      'threat.created',
      expect.any(Threat),
    );
  });
});
