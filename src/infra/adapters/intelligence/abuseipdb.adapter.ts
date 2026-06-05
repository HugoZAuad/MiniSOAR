import { Injectable, Logger } from '@nestjs/common';
import type { ThreatIntelligencePort } from '../../../core/domain/ports/threat-intelligence.port';

interface AbuseIpDbResponse {
  data: {
    ipAddress: string;
    abuseConfidenceScore: number;
    totalReports: number;
    lastReportedAt: string | null;
  };
}

@Injectable()
export class AbuseIpDbAdapter implements ThreatIntelligencePort {
  private readonly logger = new Logger(AbuseIpDbAdapter.name);
  private readonly baseUrl = 'https://api.abuseipdb.com/api/v2/check';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.ABUSEIPDB_API_KEY || '';
  }

  async getReputationScore(indicator: string): Promise<number> {
    if (!this.apiKey) {
      this.logger.warn(
        `Chave de API do AbuseIPDB não configurada (ABUSEIPDB_API_KEY). Retornando score 0 por omissão.`,
      );
      return 0;
    }

    try {
      const url = `${this.baseUrl}?ipAddress=${encodeURIComponent(indicator)}&maxAgeInDays=90`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Key: this.apiKey,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn(
          `AbuseIPDB respondeu com erro para o indicador ${indicator}. Status: ${response.status}`,
        );
        return 0;
      }

      const body = (await response.json()) as AbuseIpDbResponse;

      return body.data?.abuseConfidenceScore ?? 0;
    } catch (error) {
      this.logger.error(
        `Erro ao comunicar com a API do AbuseIPDB para o indicador ${indicator}:`,
        error,
      );
      return 0;
    }
  }
}
