import { Inject, Injectable } from '@nestjs/common';
import { Threat } from '../../domain/entities/threat.entity';
import * as threatRepositoryInterface from '../../domain/repositories/threat-repository.interface';
import { THREAT_REPOSITORY_TOKEN } from '../../domain/repositories/threat-repository.token';

@Injectable()
export class RegisterThreatUseCase {
  constructor(
    @Inject(THREAT_REPOSITORY_TOKEN)
    private threatRepository: threatRepositoryInterface.ThreatRepository,
  ) {}

  async execute(
    indicator: string,
    type: string,
    severity: number,
    data: { indicator: string; type: string; severity: number },
  ) {
    const threat = new Threat(data.indicator, data.type, data.severity);
    await this.threatRepository.save(threat);
    return threat;
  }
}
