import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/infra/guards/api-key.guard';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';

/* v8 ignore start */
@Controller('threats')
export class ThreatController {
  constructor(private readonly registerThreat: RegisterThreatUseCase) {}
  /* v8 ignore stop */

  @Post()
  @UseGuards(ApiKeyGuard)
  async register(
    @Body() body: { indicator: string; type: string; severity: number },
  ) {
    const threat = await this.registerThreat.execute(body);

    return {
      message: 'Threat registered successfully',
      id: threat.id,
    };
  }
}
