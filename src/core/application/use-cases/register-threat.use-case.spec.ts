import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThreatEmbedFactory } from '../../../infra/providers/notification/factories/threat-embed.factory';
import { Threat } from '../../domain/entities/threat.entity';
import { RegisterThreatUseCase } from './register-threat.use-case';

vi.mock('../../../infra/providers/notification/factories/threat-embed.factory');

describe('RegisterThreatUseCase', () => {
  let sut: RegisterThreatUseCase;

  const threatRepositoryMock = {
    save: vi.fn(),
    countByIndicator: vi.fn(),
  };

  const threatIntelligenceMock = {
    getReputationScore: vi.fn(),
  };

  const geoIpMock = {
    getCountry: vi.fn(),
  };

  const notificationMock = {
    sendAlert: vi.fn(),
  };

  const firewallMock = {
    block: vi.fn(),
  };

  const eventDispatcherMock = {
    dispatch: vi.fn(),
  };

  const loggerMock = {
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    threatRepositoryMock.countByIndicator.mockResolvedValue(0);
    threatIntelligenceMock.getReputationScore.mockResolvedValue(0);
    geoIpMock.getCountry.mockResolvedValue('BR');

    sut = new RegisterThreatUseCase(
      threatRepositoryMock as any,
      threatIntelligenceMock,
      geoIpMock,
      notificationMock,
      firewallMock,
      eventDispatcherMock,
    );

    Object.defineProperty(sut, 'logger', { value: loggerMock });
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

      expect(threatRepositoryMock.countByIndicator).toHaveBeenCalledWith(
        '1.1.1.1',
      );
      expect(threatIntelligenceMock.getReputationScore).toHaveBeenCalledWith(
        '1.1.1.1',
      );
      expect(geoIpMock.getCountry).toHaveBeenCalledWith('1.1.1.1');
    });

    it('deve disparar evento de criação via eventDispatcher', async () => {
      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 3 });

      expect(eventDispatcherMock.dispatch).toHaveBeenCalledWith(
        'threat.created',
        expect.any(Threat),
      );
    });

    it('deve enriquecer a threat com os dados coletados', async () => {
      threatRepositoryMock.countByIndicator.mockResolvedValue(5);
      threatIntelligenceMock.getReputationScore.mockResolvedValue(80);
      geoIpMock.getCountry.mockResolvedValue('CN');

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

      expect(threatRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(threatRepositoryMock.save).toHaveBeenCalledWith(
        expect.any(Threat),
      );
    });

    it('não deve acionar mitigação se a threat não for alto risco', async () => {
      threatIntelligenceMock.getReputationScore.mockResolvedValue(0);
      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 1 });

      expect(firewallMock.block).not.toHaveBeenCalled();
    });

    it('deve acionar mitigação via firewall se a threat for alto risco', async () => {
      threatIntelligenceMock.getReputationScore.mockResolvedValue(10);
      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 10 });

      expect(firewallMock.block).toHaveBeenCalledWith('1.1.1.1', 'IP');
    });

    it('deve logar warn ao acionar o playbook de mitigação', async () => {
      threatIntelligenceMock.getReputationScore.mockResolvedValue(10);
      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 10 });

      expect(loggerMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('[SOAR 🛡️]'),
      );
    });
  });

  describe('dispatchNotification', () => {
    it('deve chamar ThreatEmbedFactory.create e notification.sendAlert', async () => {
      const fakeEmbed = { title: 'Threat Alert' };
      vi.mocked(ThreatEmbedFactory.create).mockReturnValue(fakeEmbed as never);

      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 3 });

      expect(ThreatEmbedFactory.create).toHaveBeenCalledWith(
        expect.any(Threat),
      );
      expect(notificationMock.sendAlert).toHaveBeenCalledWith(fakeEmbed);
    });

    it('deve logar erro se o envio de notificação falhar com instância de Error', async () => {
      notificationMock.sendAlert.mockRejectedValue(
        new Error('Notification error'),
      );

      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 3 });

      expect(loggerMock.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[SOAR] Falha ao enviar alerta para o indicador 1.1.1.1:',
        ),
        'Notification error',
      );
    });

    it('deve logar erro se o envio de notificação falhar com string', async () => {
      notificationMock.sendAlert.mockRejectedValue('Generic string error');

      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 3 });

      expect(loggerMock.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[SOAR] Falha ao enviar alerta para o indicador 1.1.1.1:',
        ),
        'Generic string error',
      );
    });

    it('não deve propagar erro de notificação para o caller', async () => {
      notificationMock.sendAlert.mockRejectedValue(
        new Error('Notification error'),
      );

      await expect(
        sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 3 }),
      ).resolves.toBeInstanceOf(Threat);
    });
  });

  describe('dispatchMitigation', () => {
    it('deve logar erro crítico se o firewall falhar com instância de Error', async () => {
      firewallMock.block.mockRejectedValue(new Error('Firewall error'));
      threatIntelligenceMock.getReputationScore.mockResolvedValue(10);

      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 10 });

      expect(loggerMock.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[SOAR ❌] Falha crítica ao executar Resposta Ativa para 1.1.1.1: Firewall error',
        ),
      );
    });

    it('deve logar erro crítico se o firewall falhar com string', async () => {
      firewallMock.block.mockRejectedValue('Custom String Rejection');
      threatIntelligenceMock.getReputationScore.mockResolvedValue(10);

      await sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 10 });

      expect(loggerMock.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[SOAR ❌] Falha crítica ao executar Resposta Ativa para 1.1.1.1: Custom String Rejection',
        ),
      );
    });

    it('não deve propagar erro de mitigação para o caller', async () => {
      firewallMock.block.mockRejectedValue(new Error('Firewall error'));
      threatIntelligenceMock.getReputationScore.mockResolvedValue(10);

      await expect(
        sut.execute({ indicator: '1.1.1.1', type: 'IP', severity: 10 }),
      ).resolves.toBeInstanceOf(Threat);
    });
  });
});
