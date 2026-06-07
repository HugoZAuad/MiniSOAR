import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FilterThreatsDto } from '../../../core/application/interface/filter-threats.dto';
import { ListThreatsUseCase } from '../../../core/application/use-cases/list-threats.use-case';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';
import { RegisterThreatDto } from '../../../infra/http/dto/register-threat.dto';
import { ApiKeyGuard } from '../../guards/api-key.guard';

@Controller('threats')
@UseGuards(ApiKeyGuard)
export class ThreatController {
  constructor(
    private readonly registerThreatUseCase: RegisterThreatUseCase,
    private readonly listThreatsUseCase: ListThreatsUseCase,
  ) {}

  @Post()
  async register(@Body() data: RegisterThreatDto) {
    return await this.registerThreatUseCase.execute(data);
  }

  @Get()
  async list(@Query() query: FilterThreatsDto) {
    return await this.listThreatsUseCase.execute(query);
  }
}
