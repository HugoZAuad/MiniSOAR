import { Threat } from '../../../../core/domain/entities/threat.entity';
import { NotificationEmbed } from '../../../../core/domain/ports/notification.port';

export class ThreatEmbedFactory {
  static create(threat: Threat): NotificationEmbed {
    const COLORS = {
      CRITICAL: 0xe74c3c,
      WARNING: 0xe67e22,
      INFO: 0x3498db,
    };

    let color = COLORS.INFO;
    if (threat.isHighRisk()) {
      color = COLORS.CRITICAL;
    } else if (threat.severity >= 4) {
      color = COLORS.WARNING;
    }

    return {
      title: `${threat.isHighRisk() ? '🚨 ALERTA CRÍTICO' : '⚠️ ALERTA'} - Ameaça Identificada`,
      description: `Uma nova assinatura de ameaça foi registrada e processada pelo motor MiniSOAR.`,
      color,
      fields: [
        {
          name: '🌐 Indicador (IP/Domínio)',
          value: `\`${threat.indicator}\``,
          inline: true,
        },
        { name: '🛡️ Tipo', value: threat.type, inline: true },
        {
          name: '📊 Severidade Base',
          value: `${threat.severity}/10`,
          inline: true,
        },
        {
          name: '🧬 Score Híbrido',
          value: `**${threat.hybridScore}/10**`,
          inline: true,
        },
        {
          name: '📍 País de Origem',
          value: threat.country ?? 'Desconhecido',
          inline: true,
        },
        {
          name: '🔄 Ocorrências (Recurrência)',
          value: `${threat.recurrencyCount}`,
          inline: true,
        },
        {
          name: '📉 Score de Reputação Ext.',
          value:
            threat.reputationScore !== undefined
              ? `${threat.reputationScore}%`
              : 'N/A',
          inline: false,
        },
      ],
      footer: {
        text: 'MiniSOAR - Automação de Resposta a Incidentes',
      },
      timestamp: threat.createdAt.toISOString(),
    };
  }
}
