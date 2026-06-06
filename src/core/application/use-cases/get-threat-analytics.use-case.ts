import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ThreatRepository } from '../../domain/repositories/threat-repository.interface';
import { THREAT_REPOSITORY_TOKEN } from '../../domain/repositories/threat-repository.token';
import { ThreatAnalyticsDto } from '../interface/threat-analytics.dto';

@Injectable()
export class GetThreatAnalyticsUseCase {
  private readonly logger = new Logger(GetThreatAnalyticsUseCase.name);

  constructor(
    @Inject(THREAT_REPOSITORY_TOKEN)
    private readonly threatRepository: ThreatRepository,
  ) {}

  async execute(): Promise<ThreatAnalyticsDto> {
    this.logger.log('Executing get threat analytics use case');
    return this.threatRepository.getAnalytics();
  }
}
