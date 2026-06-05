import { Injectable, Logger } from '@nestjs/common';
import { FirewallPort } from '../../../core/domain/ports/firewall.port';

@Injectable()
export class LocalFirewallService implements FirewallPort {
  private readonly logger = new Logger(LocalFirewallService.name);

  async block(
    indicator: string,
    type: 'IP' | 'DOMAIN' | 'HASH',
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    switch (type) {
      case 'IP':
        this.logger.log(
          `[FIREWALL 🔥] COMANDO EXECUTADO: iptables -A INPUT -s ${indicator} -j DROP`,
        );
        break;
      case 'DOMAIN':
        this.logger.log(
          `[DNS SINKHOLE 🌐] COMANDO EXECUTADO: local-dns-block --domain ${indicator}`,
        );
        break;
      case 'HASH':
        this.logger.log(
          `[EDR/AV 🛡️] HASH ADICIONADO À BLACKLIST DE EXECUÇÃO: ${indicator}`,
        );
        break;
      default:
        throw new Error(
          `Tipo de indicador não suportado para mitigação: ${String(type)}`,
        );
    }
  }
}
