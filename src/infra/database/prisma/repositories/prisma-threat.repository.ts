import { Injectable } from '@nestjs/common';
import { Threat } from '../../../../core/domain/entities/threat.entity';
import { ThreatRepository } from '../../../../core/domain/repositories/threat-repository.interface';
import { PrismaThreatMapper } from '../mappers/prisma-threat.mapper';
import { PrismaService } from '../prisma.service';

/* v8 ignore start */
@Injectable()
export class PrismaThreatRepository implements ThreatRepository {
  constructor(private readonly prisma: PrismaService) {}
  /* v8 ignore stop */

  async save(threat: Threat): Promise<void> {
    const data = PrismaThreatMapper.toPrisma(threat);
    await this.prisma.threatLog.upsert({
      where: { id: threat.id },
      update: data,
      create: data,
    });
  }

  async countByIndicator(indicator: string): Promise<number> {
    return this.prisma.threatLog.count({
      where: { indicator },
    });
  }

  async findAll(): Promise<Threat[]> {
    const logs = await this.prisma.threatLog.findMany();
    return logs.map((log) => PrismaThreatMapper.toDomain(log));
  }
}
