export interface ThreatAnalyticsDto {
  totalThreats: number;
  criticalThreats: number;
  containedThreats: number;
  averageSeverity: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recentActivity?: { date: string; count: number }[];
  topIndicators?: {
    indicator: string;
    count: number;
    severity: number;
  }[];
}
