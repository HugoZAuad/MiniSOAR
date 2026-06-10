import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Threat } from '../../../core/domain/entities/threat.entity';

export interface ThreatDetectedPayload {
  threat: Threat;
  [key: string]: unknown;
}

@Injectable()
export class DynamicPlaybookListener {
  public readonly logger = new Logger(DynamicPlaybookListener.name);

  @OnEvent('threat.detected')
  handleThreatDetected(threat: Threat): void {
    if (!threat || !threat.indicator) return;

    if (threat.severity >= 4) {
      this.logger.warn(
        `[PLAYBOOK AUTOMÁTICO] Conteção iniciada para ${threat.indicator}`,
      );
    } else {
      this.logger.log(`Ameaça de baixa severidade: ${threat.indicator}`);
    }
  }
}
