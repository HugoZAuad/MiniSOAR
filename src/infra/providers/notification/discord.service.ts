import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Threat } from '../../../core/domain/entities/threat.entity';

@Injectable()
export class DiscordService {
  public readonly logger = new Logger(DiscordService.name);

  constructor(private configService: ConfigService) {}

  async sendAlert(threat: Threat): Promise<void> {
    await this.sendNotification({
      title: 'Ameaça Detectada',
      message: `Ameaça em ${threat.indicator}`,
    });
  }

  async sendNotification(payload: {
    title: string;
    message: string;
  }): Promise<void> {
    const webhookUrl = this.configService.get<string>('DISCORD_WEBHOOK_URL');

    if (!webhookUrl) {
      this.logger.warn('Webhook do Discord não configurado');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{ title: payload.title, description: payload.message }],
        }),
      });

      if (!response.ok) {
        this.logger.warn(
          `Falha ao enviar notificação Discord. Status HTTP: ${response.status}`,
        );
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Erro de rede ao contactar a API do Discord:', error);
      } else {
        this.logger.error(
          'Erro desconhecido ao contactar a API do Discord',
          error as string,
        );
      }
    }
  }
}
