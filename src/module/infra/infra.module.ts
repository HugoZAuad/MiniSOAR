// src/infra/infra.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FIREWALL_PORT } from '../../core/domain/ports/firewall.port';
import { NOTIFICATION_PORT } from '../../core/domain/ports/notification.port';
import { LocalFirewallService } from '../../infra/providers/firewall/local-firewall.service';
import { DiscordService } from '../../infra/providers/notification/discord.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: NOTIFICATION_PORT,
      useClass: DiscordService,
    },
    {
      provide: FIREWALL_PORT,
      useClass: LocalFirewallService,
    },
  ],
  exports: [NOTIFICATION_PORT, FIREWALL_PORT],
})
export class InfraModule {}
