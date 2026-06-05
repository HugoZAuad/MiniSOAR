import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalFirewallService } from './local-firewall.service';

describe('LocalFirewallService', () => {
  let service: LocalFirewallService;

  beforeEach(() => {
    service = new LocalFirewallService();
  });

  it('deve logar comando para tipo IP', async () => {
    const spy = vi.spyOn(Logger.prototype, 'log');
    await service.block('1.1.1.1', 'IP');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('iptables'));
  });

  it('deve logar comando para tipo DOMAIN', async () => {
    const spy = vi.spyOn(Logger.prototype, 'log');
    await service.block('example.com', 'DOMAIN');
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('local-dns-block'),
    );
  });

  it('deve logar comando para tipo HASH', async () => {
    const spy = vi.spyOn(Logger.prototype, 'log');
    await service.block('abc12345', 'HASH');
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('HASH ADICIONADO'),
    );
  });

  it('deve lançar erro para tipo desconhecido', async () => {
    await expect(
      service.block('value', 'UNKNOWN' as unknown as 'IP'),
    ).rejects.toThrow(
      'Tipo de indicador não suportado para mitigação: UNKNOWN',
    );
  });
});
