import { Body, Controller, Post } from '@nestjs/common';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';

/* v8 ignore start */
@Controller('threats')
export class ThreatController {
  constructor(private readonly registerThreat: RegisterThreatUseCase) {}
  /* v8 ignore stop */

  @Post()
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
