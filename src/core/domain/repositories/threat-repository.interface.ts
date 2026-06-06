import type { ThreatAnalyticsDto } from 'src/core/application/interface/threat-analytics.dto';
import { FilterThreatsDto } from '../../application/interface/filter-threats.dto';
import { PaginatedThreatsDto } from '../../application/interface/paginated-threats.dto';
import { Threat } from '../entities/threat.entity';

export interface ThreatRepository {
  save(threat: Threat): Promise<void>;
  findAll(params?: {
    indicator?: string;
    severity?: number;
  }): Promise<Threat[]>;
  countByIndicator(indicator: string): Promise<number>;
  getAnalytics(): Promise<ThreatAnalyticsDto>;
  findAll(params?: {
    indicator?: string;
    severity?: number;
  }): Promise<Threat[]>;
  findAllPaginated(params: FilterThreatsDto): Promise<PaginatedThreatsDto>;
}
