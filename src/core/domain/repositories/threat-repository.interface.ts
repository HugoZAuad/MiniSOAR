import type { ThreatAnalyticsDto } from 'src/core/application/interface/threat-analytics.dto';
import type { ThreatHistoryDto } from 'src/core/application/interface/threat-history.dto';
import { FilterThreatsDto } from '../../application/interface/filter-threats.dto';
import { PaginatedThreatsDto } from '../../application/interface/paginated-threats.dto';
import { Threat } from '../entities/threat.entity';

export interface ThreatRepository {
  save(threat: Threat): Promise<void>;
  updateContainment(threatId: string, contained: boolean): Promise<void>;
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
  findById(id: string): Promise<Threat | null>;
  getHistory(threatId: string): Promise<ThreatHistoryDto[]>;
  createHistoryEvent(
    threatId: string,
    type: string,
    title: string,
    description: string,
  ): Promise<void>;
}
