import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  ThreatIntelligencePort,
  ThreatIntelResult,
} from 'src/core/domain/ports/threat-intelligence.port';

@Injectable()
export class AbuseIpDbAdapter implements ThreatIntelligencePort {
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ABUSEIPDB_API_KEY');
  }

  async getReputationScore(indicator: string): Promise<number> {
    const result = await this.checkIp(indicator);
    return result.score;
  }

  checkIp(indicator: string): Promise<ThreatIntelResult> {
    if (!this.apiKey) {
      return Promise.resolve({
        details: 'API Key ausente',
        isMalicious: false,
        score: 0,
        provider: 'AbuseIPDB',
        indicator,
        whitelisted: false,
      });
    }

    return Promise.resolve(this.getMockResponse(indicator));
  }

  private getMockResponse(indicator: string): ThreatIntelResult {
    return {
      indicator,
      provider: 'AbuseIPDB',
      isMalicious: indicator !== '1.1.1.1',
      score: indicator === '1.1.1.1' ? 0 : 85,
      details: indicator === '1.1.1.1' ? 'limpo' : 'Brute Force',
      countryCode: 'BR',
      usageType: 'Data Center',
      whitelisted: false,
      lastReportedAt: new Date(),
    };
  }
}
