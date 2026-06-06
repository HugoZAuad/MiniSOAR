export interface FilterThreatsDto {
  page: number;
  limit: number;
  severity?: number;
  indicator?: string;
}
