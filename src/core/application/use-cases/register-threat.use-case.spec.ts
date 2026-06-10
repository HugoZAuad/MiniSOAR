import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Threat } from '../../domain/entities/threat.entity';
import type { EventDispatcher } from '../../domain/ports/event-dispatcher.port';
import type { FirewallPort } from '../../domain/ports/firewall.port';
import type { GeoIpPort } from '../../domain/ports/geoip.port';
import type { NotificationPort } from '../../domain/ports/notification.port';
import type { ThreatIntelligencePort } from '../../domain/ports/threat-intelligence.port';
import type { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { RegisterThreatUseCase } from './register-threat.use-case';

describe('RegisterThreatUseCase', () => {
  let sut: RegisterThreatUseCase;

  const threatRepositoryMock = {
    save: vi.fn(),
    countByIndicator: vi.fn(),
  } as unknown as ThreatRepository;

  const threatIntelligenceMock = {
    getReputationScore: vi.fn(),
    checkIp: vi.fn(),
  } as unknown as ThreatIntelligencePort;

  const geoIpMock = {
    getCountry: vi.fn(),
  } as unknown as GeoIpPort;

  const notificationMock = {
    sendAlert: vi.fn(),
  } as unknown as NotificationPort;

  const firewallMock = {
    block: vi.fn(),
  } as unknown as FirewallPort;

  const eventDispatcherMock = {
    dispatch: vi.fn(),
  } as unknown as EventDispatcher;

  const loggerMock = {
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(threatRepositoryMock.countByIndicator).mockResolvedValue(0);
    vi.mocked(threatIntelligenceMock.getReputationScore).mockResolvedValue(0);
    vi.mocked(geoIpMock.getCountry).mockResolvedValue('BR');

    sut = new RegisterThreatUseCase(
      threatRepositoryMock,
      threatIntelligenceMock,
      geoIpMock,
      notificationMock,
      firewallMock,
      eventDispatcherMock,
    );

    vi.spyOn(sut as any, 'logger', 'get').mockReturnValue(loggerMock);
  });

  describe('execute', () => {
    it('deve criar uma Threat com os dados recebidos no input', async () => {
      const result = await sut.execute({
        indicator: '1.1.1.1',
        type: 'IP',
        severity: 3,
      });

      expect(result).toBeInstanceOf(Threat);
      expect(result.indicator).toBe('1.1.1.1');
      expect(result.type).toBe('IP');
      expect(result.severity).toBe(3);
    });

    it('deve chamar repositório, intelligence e geoip em paralelo', async () => {
      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 3 });

      expect(
        vi.mocked(threatRepositoryMock.countByIndicator),
      ).toHaveBeenCalledWith('1.1.1.1');
      expect(
        vi.mocked(threatIntelligenceMock.getReputationScore),
      ).toHaveBeenCalledWith('1.1.1.1');
      expect(vi.mocked(geoIpMock.getCountry)).toHaveBeenCalledWith('1.1.1.1');
    });

    it('deve disparar evento de criação via eventDispatcher', async () => {
      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 3 });

      expect(vi.mocked(eventDispatcherMock.dispatch)).toHaveBeenCalledWith(
        'threat.created',
        expect.any(Threat),
      );
    });

    it('deve enriquecer a threat com os dados coletados', async () => {
      vi.mocked(threatRepositoryMock.countByIndicator).mockResolvedValue(5);
      vi.mocked(threatIntelligenceMock.getReputationScore).mockResolvedValue(
        80,
      );
      vi.mocked(geoIpMock.getCountry).mockResolvedValue('CN');

      const result = await sut.execute({
        indicator: '2.2.2.2',
        type: 'IP',
        severity: 5,
      });

      expect(result.recurrencyCount).toBe(5);
      expect(result.reputationScore).toBe(80);
      expect(result.country).toBe('CN');
    });

    it('deve salvar a threat no repositório após enriquecer', async () => {
      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 3 });

      expect(vi.mocked(threatRepositoryMock.save)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(threatRepositoryMock.save)).toHaveBeenCalledWith(
        expect.any(Threat),
      );
    });

    it('não deve acionar mitigação se a threat não for alto risco', async () => {
      vi.mocked(threatIntelligenceMock.getReputationScore).mockResolvedValue(0);
      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 1 });

      expect(vi.mocked(firewallMock.block)).not.toHaveBeenCalled();
    });

    it('deve acionar mitigação via firewall se a threat for alto risco', async () => {
      vi.mocked(threatIntelligenceMock.getReputationScore).mockResolvedValue(
        10,
      );
      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 10 });

      expect(vi.mocked(firewallMock.block)).toHaveBeenCalledWith(
        '1.1.1.1',
        'IP',
      );
    });
  });

  describe('dispatchNotification - branch coverage', () => {
    it('deve cobrir o branch de Error (instanceof Error = true)', async () => {
      // Força o caminho: error instanceof Error
      vi.mocked(notificationMock.sendAlert).mockRejectedValue(
        new Error('Erro real de sistema'),
      );

      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 3 });

      expect(vi.mocked(loggerMock.error)).toHaveBeenCalledWith(
        expect.stringContaining(
          '[SOAR] Falha ao enviar alerta para 1.1.1.1: Erro real de sistema',
        ),
      );
    });

    it('deve cobrir o branch de String (instanceof Error = false)', async () => {
      // Força o caminho: else { String(error) }
      vi.mocked(notificationMock.sendAlert).mockRejectedValue(
        'Erro de string simples',
      );

      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 3 });

      expect(vi.mocked(loggerMock.error)).toHaveBeenCalledWith(
        expect.stringContaining(
          '[SOAR] Falha ao enviar alerta para 1.1.1.1: Erro de string simples',
        ),
      );
    });
  });

  describe('dispatchMitigation - branch coverage', () => {
    it('deve cobrir o branch de Error (instanceof Error = true)', async () => {
      vi.mocked(firewallMock.block).mockRejectedValue(
        new Error('Firewall erro crítico'),
      );
      vi.mocked(threatIntelligenceMock.getReputationScore).mockResolvedValue(
        10,
      );

      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 10 });

      expect(vi.mocked(loggerMock.error)).toHaveBeenCalledWith(
        expect.stringContaining(
          '[SOAR ❌] Falha ao executar Resposta Ativa: Firewall erro crítico',
        ),
      );
    });

    it('deve cobrir o branch de String (instanceof Error = false)', async () => {
      vi.mocked(firewallMock.block).mockRejectedValue(
        'Firewall falha genérica',
      );
      vi.mocked(threatIntelligenceMock.getReputationScore).mockResolvedValue(
        10,
      );

      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 10 });

      expect(vi.mocked(loggerMock.error)).toHaveBeenCalledWith(
        expect.stringContaining(
          '[SOAR ❌] Falha ao executar Resposta Ativa: Firewall falha genérica',
        ),
      );
    });
  });
});
