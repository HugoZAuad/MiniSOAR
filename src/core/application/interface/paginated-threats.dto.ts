import { Threat } from '../../domain/entities/threat.entity';

export interface PaginatedThreatsDto {
  data: Threat[];
  total: number;
  page: number;
  limit: number;
}
