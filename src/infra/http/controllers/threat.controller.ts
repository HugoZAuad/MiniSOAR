import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { FilterThreatsDto } from '../../../core/application/interface/filter-threats.dto';
import { ContainThreatUseCase } from '../../../core/application/use-cases/contain-threat.use-case';
import { GetThreatHistoryUseCase } from '../../../core/application/use-cases/get-threat-history.use-case';
import { GetThreatUseCase } from '../../../core/application/use-cases/get-threat.use-case';
import { ListThreatsUseCase } from '../../../core/application/use-cases/list-threats.use-case';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';
import { ReleaseThreatUseCase } from '../../../core/application/use-cases/release-threat.use-case';
import { RegisterThreatDto } from '../../../infra/http/dto/register-threat.dto';
import { ApiKeyGuard } from '../../guards/api-key.guard';

@Controller('threats')
@UseGuards(ApiKeyGuard)
export class ThreatController {
  constructor(
    private readonly registerThreatUseCase: RegisterThreatUseCase,
    private readonly listThreatsUseCase: ListThreatsUseCase,
    private readonly containThreatUseCase: ContainThreatUseCase,
    private readonly releaseThreatUseCase: ReleaseThreatUseCase,
    private readonly getThreatUseCase: GetThreatUseCase,
    private readonly getThreatHistoryUseCase: GetThreatHistoryUseCase,
  ) {}

  @Post()
  async register(@Body() data: RegisterThreatDto) {
    return await this.registerThreatUseCase.execute(data);
  }

  @Get()
  async list(@Query() query: FilterThreatsDto) {
    return await this.listThreatsUseCase.execute(query);
  }

  @Get(':id/history')
  async history(@Param('id') id: string) {
    return this.getThreatHistoryUseCase.execute(id);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getThreatUseCase.execute(id);
  }

  @Patch(':id/contain')
  async contain(@Param('id') id: string) {
    return await this.containThreatUseCase.execute(id);
  }

  @Patch(':id/release')
  async release(@Param('id') id: string) {
    return await this.releaseThreatUseCase.execute(id);
  }
}