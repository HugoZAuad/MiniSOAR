import { Test } from '@nestjs/testing';
import { Server } from 'socket.io';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Threat } from '../../core/domain/entities/threat.entity';
import { ThreatGateway } from './threat.gateway';

describe('ThreatGateway', () => {
  let gateway: ThreatGateway;
  const mockServer = { emit: vi.fn() } as unknown as Server;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ThreatGateway],
    }).compile();

    gateway = module.get<ThreatGateway>(ThreatGateway);
    gateway.server = mockServer;
  });

  it('deve emitir evento threat-alert quando receber threat.created', () => {
    const mockThreat = { indicator: '1.1.1.1' } as unknown as Threat;
    gateway.handleThreatCreatedEvent(mockThreat);

    expect(mockServer.emit).toHaveBeenCalledWith('threat-alert', mockThreat);
  });
});
