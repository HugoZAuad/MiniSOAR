export const NOTIFICATION_PORT = 'NOTIFICATION_PORT';

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface NotificationEmbed {
  title: string;
  description: string;
  color: number;
  fields: EmbedField[];
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

export interface NotificationPort {
  sendAlert(embed: NotificationEmbed): Promise<void>;
}
