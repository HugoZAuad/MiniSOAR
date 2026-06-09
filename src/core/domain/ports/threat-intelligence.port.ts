export const THREAT_INTELLIGENCE_PORT = Symbol('ThreatIntelligencePort');

export interface ThreatIntelReputation {
  indicator: string;
  isMalicious: boolean;
  score: number;
  provider: string;
  countryCode?: string;
  usageType?: string;
  whitelisted: boolean;
  details: string;
  lastReportedAt?: string;
}

export interface ThreatIntelligencePort {
  checkIp(ip: string): Promise<ThreatIntelReputation>;
}
