import { Body, Controller, Get, Post } from '@nestjs/common';
import { ListThreatsUseCase } from '../../../core/application/use-cases/list-threats.use-case';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';

@Controller('threats')
export class ThreatController {
  constructor(
    private readonly registerThreatUseCase: RegisterThreatUseCase,
    private readonly listThreatsUseCase: ListThreatsUseCase,
  ) {}

  @Post()
  async register(@Body() data: any) {
    return await this.registerThreatUseCase.execute(data);
  }

  @Get()
  async list() {
    return await this.listThreatsUseCase.execute();
  }
}
