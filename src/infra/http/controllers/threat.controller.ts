import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { FilterThreatsDto } from '../../../core/application/interface/filter-threats.dto';
import { ListThreatsUseCase } from '../../../core/application/use-cases/list-threats.use-case';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';
import { RegisterThreatDto } from '../../../infra/http/dto/register-threat.dto';

@Controller('threats')
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
