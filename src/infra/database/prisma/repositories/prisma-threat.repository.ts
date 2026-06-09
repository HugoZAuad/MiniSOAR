import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { FilterThreatsDto } from 'src/core/application/interface/filter-threats.dto';
import type { PaginatedThreatsDto } from 'src/core/application/interface/paginated-threats.dto';
import { ThreatAnalyticsDto } from '../../../../core/application/interface/threat-analytics.dto';
import { Threat } from '../../../../core/domain/entities/threat.entity';
import { EVENT_DISPATCHER_PORT } from '../../../../core/domain/ports/event-dispatcher.port';
import { ThreatRepository } from '../../../../core/domain/repositories/threat-repository.interface';
import { PrismaThreatMapper } from '../mappers/prisma-threat.mapper';
import { PrismaService } from '../prisma.service';

interface EventDispatcher {
  emit?: (event: string, payload: unknown) => Promise<void>;
  dispatch?: (event: string, payload: unknown) => Promise<void>;
}

@Injectable()
export class PrismaThreatRepository implements ThreatRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_DISPATCHER_PORT)
    private readonly eventDispatcher: EventDispatcher | null,
  ) {}

  async save(threat: Threat): Promise<void> {
    const data = PrismaThreatMapper.toPrisma(threat);

    await this.prisma.threatLog.upsert({
      where: { id: threat.id },
      update: data,
      create: data,
    });

    if (
      this.eventDispatcher &&
      typeof this.eventDispatcher.emit === 'function'
    ) {
      await this.eventDispatcher.emit('threat.detected', { threat });
    } else if (
      this.eventDispatcher &&
      typeof this.eventDispatcher.dispatch === 'function'
    ) {
      await this.eventDispatcher.dispatch('threat.detected', { threat });
    }
  }

  async countByIndicator(indicator: string): Promise<number> {
    return this.prisma.threatLog.count({
      where: { indicator },
    });
  }

  async findAll(params?: {
    indicator?: string;
    severity?: number;
  }): Promise<Threat[]> {
    const where: Prisma.ThreatLogWhereInput = {};

    if (params?.indicator) {
      where.indicator = params.indicator;
    }

    if (params?.severity) {
      where.severity = params.severity;
    }

    const logs = await this.prisma.threatLog.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
    });

    return logs.map((log) => PrismaThreatMapper.toDomain(log));
  }

  async findAllPaginated(
    params: FilterThreatsDto,
  ): Promise<PaginatedThreatsDto> {
    const { page = 1, limit = 10, severity, indicator } = params;

    const safePage = Number(page);
    const safeLimit = Number(limit);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.ThreatLogWhereInput = {
      severity: severity ? Number(severity) : undefined,
      indicator: indicator ? { contains: indicator } : undefined,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.threatLog.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.threatLog.count({ where }),
    ]);

    return {
      data: data.map((log) => PrismaThreatMapper.toDomain(log)),
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getAnalytics(): Promise<ThreatAnalyticsDto> {
    const [totalThreats, severityGroups, topIndicators] = await Promise.all([
      this.prisma.threatLog.count(),
      this.prisma.threatLog.groupBy({
        by: ['severity'],
        _count: { severity: true },
      }),
      this.prisma.threatLog.groupBy({
        by: ['indicator'],
        _count: { indicator: true },
        orderBy: { _count: { indicator: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalThreats,
      bySeverity: severityGroups.map((g) => ({
        level: g.severity,
        count: g._count.severity,
      })),
      topIndicators: topIndicators.map((i) => ({
        indicator: i.indicator,
        count: i._count.indicator,
      })),
    };
  }
}
