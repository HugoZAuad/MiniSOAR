export const THREAT_INTELLIGENCE_PORT = Symbol('ThreatIntelligencePort');

export interface ThreatIntelligencePort {
  getReputationScore(indicator: string): Promise<number>;
}
