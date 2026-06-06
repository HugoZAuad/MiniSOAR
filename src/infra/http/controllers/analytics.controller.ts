import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetThreatAnalyticsUseCase } from '../../../core/application/use-cases/get-threat-analytics.use-case';
import { ApiKeyGuard } from '../../guards/api-key.guard';

@Controller('analytics')
@UseGuards(ApiKeyGuard)
export class AnalyticsController {
  constructor(
    private readonly getThreatAnalyticsUseCase: GetThreatAnalyticsUseCase,
  ) {}

  @Get()
  async getAnalytics() {
    return await this.getThreatAnalyticsUseCase.execute();
  }
}
