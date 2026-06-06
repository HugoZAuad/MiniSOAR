import { Injectable } from '@nestjs/common';
import type { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { FilterThreatsDto } from '../interface/filter-threats.dto';
import { PaginatedThreatsDto } from '../interface/paginated-threats.dto';

@Injectable()
export class ListThreatsUseCase {
  constructor(private readonly threatRepository: ThreatRepository) {}

  async execute(params: FilterThreatsDto): Promise<PaginatedThreatsDto> {
    return await this.threatRepository.findAllPaginated(params);
  }
}
