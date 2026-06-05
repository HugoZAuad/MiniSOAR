import { Injectable, Logger } from '@nestjs/common';
import type { GeoIpPort } from '../../../core/domain/ports/geoip.port';

interface IpApiResponse {
  status: 'success' | 'fail';
  countryCode?: string;
  message?: string;
}

@Injectable()
export class FetchGeoIpAdapter implements GeoIpPort {
  private readonly logger = new Logger(FetchGeoIpAdapter.name);
  private readonly baseUrl = 'http://ip-api.com/json';

  async getCountry(ip: string): Promise<string | undefined> {
    if (this.isPrivateIp(ip)) {
      return 'LOCAL';
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${ip}?fields=status,countryCode,message`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `Falha na requisição de GeoIP para o IP ${ip}. Status: ${response.status}`,
        );
        return undefined;
      }

      const data = (await response.json()) as IpApiResponse;

      if (data.status === 'fail') {
        this.logger.warn(
          `API de GeoIP retornou erro para o IP ${ip}: ${data.message}`,
        );
        return undefined;
      }

      return data.countryCode;
    } catch (error) {
      this.logger.error(
        `Erro inesperado ao consultar GeoIP para o IP ${ip}:`,
        error,
      );
      return undefined;
    }
  }

  private isPrivateIp(ip: string): boolean {
    return (
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.')
    );
  }
}
