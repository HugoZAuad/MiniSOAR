import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Threat } from '../../../core/domain/entities/threat.entity';
import { DiscordService } from './discord.service';

describe('DiscordService', () => {
  let service: DiscordService;
  let mockConfigService: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();

    mockConfigService = { get: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<DiscordService>(DiscordService);
  });

  it('deve enviar notificação com sucesso ao chamar sendAlert', async () => {
    mockConfigService.get.mockReturnValue('http://webhook.url');
    vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);

    const threat = { indicator: '8.8.8.8' } as Threat;
    await expect(service.sendAlert(threat)).resolves.not.toThrow();
    expect(global.fetch).toHaveBeenCalled();
  });

  it('deve ignorar se webhookUrl estiver faltando', async () => {
    mockConfigService.get.mockReturnValue(null);
    const loggerSpy = vi
      .spyOn(service['logger'], 'warn')
      .mockImplementation(() => undefined);

    await service.sendNotification({ title: 't', message: 'm' });

    expect(loggerSpy).toHaveBeenCalledWith(
      'Webhook do Discord não configurado',
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('deve enviar notificação com sucesso via sendNotification', async () => {
    mockConfigService.get.mockReturnValue('http://webhook.url');
    vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);

    await service.sendNotification({ title: 't', message: 'm' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://webhook.url',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('deve logar aviso se o response.ok for falso', async () => {
    mockConfigService.get.mockReturnValue('http://url');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);
    const loggerSpy = vi
      .spyOn(service['logger'], 'warn')
      .mockImplementation(() => undefined);

    await service.sendNotification({ title: 't', message: 'm' });

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Status HTTP: 404'),
    );
  });

  it('deve logar erro se ocorrer falha na rede (instância de Error)', async () => {
    mockConfigService.get.mockReturnValue('http://url');
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network Error'));
    const loggerSpy = vi
      .spyOn(service['logger'], 'error')
      .mockImplementation(() => undefined);

    await service.sendNotification({ title: 't', message: 'm' });

    expect(loggerSpy).toHaveBeenCalledWith(
      'Erro de rede ao contactar a API do Discord:',
      expect.any(Error),
    );
  });

  it('deve logar erro se ocorrer falha na rede (erro desconhecido)', async () => {
    mockConfigService.get.mockReturnValue('http://url');
    vi.mocked(global.fetch).mockRejectedValue('String Error');
    const loggerSpy = vi
      .spyOn(service['logger'], 'error')
      .mockImplementation(() => undefined);

    await service.sendNotification({ title: 't', message: 'm' });

    expect(loggerSpy).toHaveBeenCalledWith(
      'Erro desconhecido ao contactar a API do Discord',
      'String Error',
    );
  });
});
