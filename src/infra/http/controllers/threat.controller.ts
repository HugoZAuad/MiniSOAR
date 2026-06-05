import { Body, Controller, Post } from '@nestjs/common';
import { RegisterThreatUseCase } from '../../../core/application/use-cases/register-threat.use-case';

@Controller('threats')
export class ThreatController {
  constructor(private registerThreat: RegisterThreatUseCase) {}

  @Post()
  async register(
    @Body() body: { indicator: string; type: string; severity: number },
  ) {
    const threat = await this.registerThreat.execute(
      body.indicator,
      body.type,
      body.severity,
      body,
    );
    return {
      message: 'Threat registered successfully',
      id: threat.id,
    };
  }
}
