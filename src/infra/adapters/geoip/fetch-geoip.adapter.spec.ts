import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FetchGeoIpAdapter } from './fetch-geoip.adapter';

describe('FetchGeoIpAdapter', () => {
  let adapter: FetchGeoIpAdapter;

  beforeEach(() => {
    adapter = new FetchGeoIpAdapter();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deve retornar "LOCAL" instantaneamente para IPs privados sem disparar requisições HTTP', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const result = await adapter.getCountry('192.168.1.1');

    expect(result).toBe('LOCAL');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('deve retornar o código do país em caso de sucesso da API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'success',
          countryCode: 'BR',
          country: 'BR',
        }),
    } as Response);

    const result = await adapter.getCountry('200.200.200.200');

    expect(result).toBe('BR');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('200.200.200.200'),
      expect.any(Object),
    );
  });

  it('deve retornar undefined se a API falhar no status HTTP', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const result = await adapter.getCountry('8.8.8.8');

    expect(result).toBeUndefined();
  });

  it('deve retornar undefined com resiliência se a requisição estourar uma exceção de rede', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network Timeout'));

    const result = await adapter.getCountry('8.8.8.8');

    expect(result).toBeUndefined();
  });

  it('deve retornar undefined se a API responder com status 200 mas o body interno indicar falha', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'fail', message: 'invalid query' }),
    } as Response);

    const result = await adapter.getCountry('invalid-ip');

    expect(result).toBeUndefined();
  });
});
