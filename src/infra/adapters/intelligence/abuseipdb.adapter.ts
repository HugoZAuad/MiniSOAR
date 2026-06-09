import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AbuseIpDbResult {
  indicator: string;
  provider: string;
  isMalicious: boolean;
  score: number;
  details: string;
  countryCode: string;
  usageType: string;
  whitelisted: boolean;
  lastReportedAt: Date;
}

@Injectable()
export class AbuseIpDbAdapter {
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ABUSEIPDB_API_KEY');
  }

  public getMockResponse(indicator: string): AbuseIpDbResult {
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

  getReputationScore(indicator: string): number {
    void indicator;
    throw new Error('Method not implemented.');
  }

  async checkIp(indicator: string): Promise<AbuseIpDbResult> {
    if (!this.apiKey) {
      return {
        details: 'API Key ausente',
        isMalicious: false,
        score: 0,
        provider: 'AbuseIPDB',
        indicator,
        countryCode: 'BR',
        usageType: 'Data Center',
        whitelisted: false,
        lastReportedAt: new Date(),
      };
    }

    return await Promise.resolve(this.getMockResponse(indicator));
  }
}
