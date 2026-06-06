import type { ThreatRepository } from 'src/core/domain/repositories/threat-repository.interface';
import { FilterThreatsDto } from '../interface/filter-threats.dto';
import { PaginatedThreatsDto } from '../interface/paginated-threats.dto';

export class ListThreatsUseCase {
  constructor(private readonly threatRepository: ThreatRepository) {}

  async execute(filters: FilterThreatsDto): Promise<PaginatedThreatsDto> {
    return await this.threatRepository.findAllPaginated(filters);
  }
}
