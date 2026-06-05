import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NotificationEmbed,
  NotificationPort,
} from '../../../core/domain/ports/notification.port';

@Injectable()
export class DiscordService implements NotificationPort {
  private readonly logger = new Logger(DiscordService.name);
  private readonly webhookUrl: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>('DISCORD_WEBHOOK_URL');
  }

  async sendAlert(embed: NotificationEmbed): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.warn(
        'Webhook do Discord não configurado (DISCORD_WEBHOOK_URL). Pulando envio de alerta.',
      );
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Falha ao enviar alerta para o Discord. Status: ${response.status} - ${errorText}`,
        );
        return;
      }

      this.logger.log('Alerta tático enviado com sucesso para o Discord.');
    } catch (error) {
      this.logger.error(
        'Erro inesperado ao comunicar com o webhook do Discord:',
        error,
      );
    }
  }
}
