export const FIREWALL_PORT = 'FIREWALL_PORT';

export interface FirewallPort {
  block(indicator: string, type: 'IP' | 'DOMAIN' | 'HASH'): Promise<void>;
}
