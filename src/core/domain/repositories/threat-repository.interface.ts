import { Threat } from '../entities/threat.entity';

export interface ThreatRepository {
  save(threat: Threat): Promise<void>;
  findAll(): Promise<Threat[]>;
}