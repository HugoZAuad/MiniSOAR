import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { THREAT_REPOSITORY_TOKEN } from 'src/core/domain/repositories/threat-repository.token';
import type { ThreatRepository } from '../../domain/repositories/threat-repository.interface';

@Injectable()
export class GetThreatUseCase {
  constructor(
    @Inject(THREAT_REPOSITORY_TOKEN)
    private readonly repository: ThreatRepository,
  ) {}

  async execute(id: string) {
    const threat = await this.repository.findById(id);

    if (!threat) {
      throw new NotFoundException('Threat not found');
    }

    return threat;
  }
}
