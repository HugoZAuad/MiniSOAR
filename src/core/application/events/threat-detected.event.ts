import { Threat } from '../../domain/entities/threat.entity';

export class ThreatDetectedEvent {
  constructor(public readonly threat: Threat) {}
}
