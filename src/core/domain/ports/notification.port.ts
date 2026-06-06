import { Threat } from '../entities/threat.entity';

export const NOTIFICATION_PORT = 'NOTIFICATION_PORT';

export interface NotificationPort {
  sendAlert(threat: Threat): Promise<void>;
}
