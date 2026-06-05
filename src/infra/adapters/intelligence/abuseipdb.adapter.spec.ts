import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AbuseIpDbAdapter } from './abuseipdb.adapter';

describe('AbuseIpDbAdapter', () => {
  const originalEnv = process.env.ABUSEIPDB_API_KEY;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    process.env.ABUSEIPDB_API_KEY = originalEnv;
    vi.unstubAllGlobals();
  });

  it('deve retornar score 0 se a variável ABUSEIPDB_API_KEY não estiver configurada', async () => {
    process.env.ABUSEIPDB_API_KEY = '';
    const adapter = new AbuseIpDbAdapter();

    const result = await adapter.getReputationScore('1.1.1.1');

    expect(result).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('deve retornar o score de reputação correto vindo da API', async () => {
    process.env.ABUSEIPDB_API_KEY = 'valid-key';
    const adapter = new AbuseIpDbAdapter();

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { abuseConfidenceScore: 72 } }),
    } as Response);

    const result = await adapter.getReputationScore('1.1.1.1');

    expect(result).toBe(72);
  });

  it('deve retornar score 0 se a API responder com erro HTTP', async () => {
    process.env.ABUSEIPDB_API_KEY = 'valid-key';
    const adapter = new AbuseIpDbAdapter();

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    const result = await adapter.getReputationScore('1.1.1.1');

    expect(result).toBe(0);
  });

  it('deve retornar score 0 e capturar o erro com resiliência se o fetch estourar uma exceção de rede', async () => {
    process.env.ABUSEIPDB_API_KEY = 'valid-key';
    const adapter = new AbuseIpDbAdapter();

    vi.mocked(fetch).mockRejectedValueOnce(new Error('Connection aborted'));

    const result = await adapter.getReputationScore('1.1.1.1');

    expect(result).toBe(0);
  });

  it('deve capturar com resiliencia excecoes que nao sao instancias de Error', async () => {
    process.env.ABUSEIPDB_API_KEY = 'valid-key';
    const adapter = new AbuseIpDbAdapter();

    vi.mocked(globalThis.fetch).mockRejectedValueOnce('String de erro pura');

    const result = await adapter.getReputationScore('1.1.1.1');

    expect(result).toBe(0);
  });

  it('deve retornar score 0 se a API responder com status 200 mas o corpo JSON estiver malformado ou sem dados', async () => {
    process.env.ABUSEIPDB_API_KEY = 'valid-key';
    const adapter = new AbuseIpDbAdapter();

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    const result = await adapter.getReputationScore('1.1.1.1');

    expect(result).toBe(0);
  });
});
