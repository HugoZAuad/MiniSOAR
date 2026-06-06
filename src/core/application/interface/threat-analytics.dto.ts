export interface ThreatAnalyticsDto {
  totalThreats: number;
  bySeverity: {
    level: number;
    count: number;
  }[];
  topIndicators: {
    indicator: string;
    count: number;
  }[];
}
