import { Injectable } from '@nestjs/common';
import { type ThreatItemDto } from '../interface/ingest-threats.dto';
import { RegisterThreatUseCase } from './register-threat.use-case';

@Injectable()
export class IngestThreatsUseCase {
  constructor(private readonly registerThreatUseCase: RegisterThreatUseCase) {}

  async execute(threats: ThreatItemDto[]): Promise<void> {
    for (const threat of threats) {
      await this.registerThreatUseCase.execute(threat);
    }
  }
}
