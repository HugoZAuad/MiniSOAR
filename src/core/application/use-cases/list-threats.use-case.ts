import { Inject, Injectable } from '@nestjs/common';
import type { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { THREAT_REPOSITORY_TOKEN } from '../../domain/repositories/threat-repository.token';
import { FilterThreatsDto } from '../interface/filter-threats.dto';
import { PaginatedThreatsDto } from '../interface/paginated-threats.dto';

@Injectable()
export class ListThreatsUseCase {
  constructor(
    @Inject(THREAT_REPOSITORY_TOKEN)
    private readonly threatRepository: ThreatRepository,
  ) {}

  async execute(filters: FilterThreatsDto): Promise<PaginatedThreatsDto> {
    return await this.threatRepository.findAllPaginated(filters);
  }
}
