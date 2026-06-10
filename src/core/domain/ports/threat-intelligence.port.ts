export const THREAT_INTELLIGENCE_PORT = Symbol('THREAT_INTELLIGENCE_PORT');

export interface ThreatIntelResult {
  indicator: string;
  isMalicious: boolean;
  score: number;
  provider: string;
  countryCode?: string;
  usageType?: string;
  whitelisted: boolean;
  details: string;
  lastReportedAt?: Date;
}

export interface ThreatIntelligencePort {
  getReputationScore(indicator: string): Promise<number>;
  checkIp(ip: string): Promise<ThreatIntelResult>;
}
