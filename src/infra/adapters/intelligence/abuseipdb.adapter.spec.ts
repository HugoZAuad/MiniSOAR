import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AbuseIpDbAdapter, AbuseIpDbResult } from './abuseipdb.adapter';

describe('AbuseIpDbAdapter', () => {
  let adapter: AbuseIpDbAdapter;
  let mockConfigService: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockConfigService = { get: vi.fn() };
    adapter = new AbuseIpDbAdapter(
      mockConfigService as unknown as ConfigService,
    );
  });

  it('deve retornar mock seguro se API_KEY for null', async () => {
    mockConfigService.get.mockReturnValue(null);
    const adapterWithNull = new AbuseIpDbAdapter(
      mockConfigService as unknown as ConfigService,
    );

    const result: AbuseIpDbResult = await adapterWithNull.checkIp('1.1.1.1');
    expect(result.details).toBe('API Key ausente');
    expect(result.isMalicious).toBe(false);
  });

  it('deve retornar IP limpo para 1.1.1.1 com apiKey presente', async () => {
    mockConfigService.get.mockReturnValue('valid-key');
    const adapterWithKey = new AbuseIpDbAdapter(
      mockConfigService as unknown as ConfigService,
    );

    const result: AbuseIpDbResult = await adapterWithKey.checkIp('1.1.1.1');
    expect(result.isMalicious).toBe(false);
  });

  it('deve retornar IP malicioso para IPs diferentes de 1.1.1.1', async () => {
    mockConfigService.get.mockReturnValue('valid-key');
    const adapterWithKey = new AbuseIpDbAdapter(
      mockConfigService as unknown as ConfigService,
    );

    const result: AbuseIpDbResult =
      await adapterWithKey.checkIp('185.220.101.5');
    expect(result.isMalicious).toBe(true);
  });

  it('deve propagar erro se getMockResponse lançar exceção', async () => {
    mockConfigService.get.mockReturnValue('valid-key');
    const adapterWithKey = new AbuseIpDbAdapter(
      mockConfigService as unknown as ConfigService,
    );

    vi.spyOn(adapterWithKey, 'getMockResponse').mockImplementation(() => {
      throw new Error('Falha simulada');
    });

    await expect(adapterWithKey.checkIp('1.1.1.1')).rejects.toThrow(
      'Falha simulada',
    );
  });

  it('deve lançar erro ao chamar getReputationScore (não implementado)', () => {
    expect(() => adapter.getReputationScore('1.1.1.1')).toThrow(
      'Method not implemented.',
    );
  });
});
