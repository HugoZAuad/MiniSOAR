import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AbuseIpDbAdapter } from './abuseipdb.adapter';

describe('AbuseIpDbAdapter', () => {
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn(),
    } as unknown as ConfigService;
  });

  it('deve retornar mock seguro se API_KEY for null', async () => {
    vi.mocked(mockConfigService.get).mockReturnValue(undefined);

    const adapter = new AbuseIpDbAdapter(mockConfigService);

    const result = await adapter.checkIp('1.1.1.1');
    expect(result.score).toBe(0);
    expect(result.details).toBe('API Key ausente');
  });

  it('deve retornar IP limpo para 1.1.1.1 com apiKey presente', async () => {
    vi.mocked(mockConfigService.get).mockReturnValue('mock-key');

    const adapter = new AbuseIpDbAdapter(mockConfigService);

    const result = await adapter.checkIp('1.1.1.1');
    expect(result.score).toBe(0);
  });

  it('deve retornar IP malicioso para IPs diferentes de 1.1.1.1', async () => {
    vi.mocked(mockConfigService.get).mockReturnValue('mock-key');

    const adapter = new AbuseIpDbAdapter(mockConfigService);

    const result = await adapter.checkIp('8.8.8.8');
    expect(result.score).toBe(85);
  });

  it('deve retornar score correto via getReputationScore', async () => {
    vi.mocked(mockConfigService.get).mockReturnValue('mock-key');

    const adapter = new AbuseIpDbAdapter(mockConfigService);

    const score = await adapter.getReputationScore('8.8.8.8');
    expect(score).toBe(85);
  });
});
