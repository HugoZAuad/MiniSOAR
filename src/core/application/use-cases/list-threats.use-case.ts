import { Injectable } from '@nestjs/common';
import type { ThreatRepository } from '../../domain/repositories/threat-repository.interface';

@Injectable()
export class ListThreatsUseCase {
  constructor(private readonly threatRepository: ThreatRepository) {}

  async execute() {
    return await this.threatRepository.findAll();
  }
}
