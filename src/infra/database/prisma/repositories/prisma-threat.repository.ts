import { Injectable } from '@nestjs/common'; // Adicione este import
import { Threat } from '../../../../core/domain/entities/threat.entity';
import { ThreatRepository } from '../../../../core/domain/repositories/threat-repository.interface';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaThreatRepository implements ThreatRepository {
  constructor(private prisma: PrismaService) {}

  async save(threat: Threat): Promise<void> {
    await this.prisma.threatLog.create({
      data: {
        id: threat.id,
        indicator: threat.indicator,
        type: threat.type,
        severity: threat.severity,
        createdAt: threat.createdAt,
      },
    });
  }

  async findAll(): Promise<Threat[]> {
    const logs = await this.prisma.threatLog.findMany();
    return logs.map(log => new Threat(log.indicator, log.type, log.severity, log.createdAt, log.id));
  }
}
