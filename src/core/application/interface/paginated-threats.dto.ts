import { Threat } from '../../domain/entities/threat.entity';

export interface PaginatedThreatsDto {
  data: Threat[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
