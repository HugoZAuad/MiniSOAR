/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Threat } from '../../../../core/domain/entities/threat.entity';
import { EVENT_DISPATCHER_PORT } from '../../../../core/domain/ports/event-dispatcher.port';
import { PrismaThreatMapper } from '../mappers/prisma-threat.mapper';
import { PrismaService } from '../prisma.service';
import { PrismaThreatRepository } from './prisma-threat.repository';

vi.mock('../mappers/prisma-threat.mapper');

interface MockThreatLog {
  upsert: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  findMany: ReturnType<typeof vi.fn>;
  groupBy: ReturnType<typeof vi.fn>;
}

interface MockPrisma {
  threatLog: MockThreatLog;
  $transaction: ReturnType<typeof vi.fn>;
}

const mockPrismaService: MockPrisma = {
  threatLog: {
    upsert: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
    groupBy: vi.fn(),
  },
  $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
};

const mockEventDispatcher = {
  dispatch: vi.fn(),
  emit: vi.fn(),
};

function makeThreat(): Threat {
  return Object.assign(Object.create(Threat.prototype) as Threat, {
    id: 'threat-uuid-123',
    sourceIp: '185.220.101.5',
    targetIp: '10.0.0.4',
    severity: 1,
    indicator: 'Tor Exit Node',
    timestamp: new Date(),
  });
}

describe('PrismaThreatRepository', () => {
  let repository: PrismaThreatRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaThreatRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EVENT_DISPATCHER_PORT, useValue: mockEventDispatcher },
      ],
    }).compile();

    repository = module.get<PrismaThreatRepository>(PrismaThreatRepository);
    vi.resetAllMocks();

    mockPrismaService.$transaction.mockImplementation(((
      ops: Promise<unknown>[],
    ) => Promise.all(ops)) as any);
  });

  describe('save', () => {
    it('deve persistir ameaça e disparar evento via emit', async () => {
      mockPrismaService.threatLog.upsert.mockResolvedValue({
        id: 'threat-uuid-123',
      });
      const threat = makeThreat();
      await repository.save(threat);
      expect(mockPrismaService.threatLog.upsert).toHaveBeenCalled();
      expect(mockEventDispatcher.emit).toHaveBeenCalledWith('threat.detected', {
        threat,
      });
      expect(mockEventDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it('deve usar dispatch quando emit não existir no eventDispatcher', async () => {
      const dispatchOnlyDispatcher = {
        dispatch: vi.fn().mockResolvedValue(undefined),
      };
      const repo = new PrismaThreatRepository(
        mockPrismaService as unknown as PrismaService,
        dispatchOnlyDispatcher,
      );
      mockPrismaService.threatLog.upsert.mockResolvedValue({});
      const threat = makeThreat();
      await repo.save(threat);
      expect(dispatchOnlyDispatcher.dispatch).toHaveBeenCalledWith(
        'threat.detected',
        { threat },
      );
    });

    it('deve persistir sem disparar evento se eventDispatcher não tiver emit nem dispatch', async () => {
      const dispatcherWithoutMethods = {};
      const repo = new PrismaThreatRepository(
        mockPrismaService as unknown as PrismaService,
        dispatcherWithoutMethods,
      );
      mockPrismaService.threatLog.upsert.mockResolvedValue({});

      const threat = makeThreat();
      await expect(repo.save(threat)).resolves.not.toThrow();
    });

    it('deve persistir sem disparar evento se eventDispatcher for null', async () => {
      const repo = new PrismaThreatRepository(
        mockPrismaService as unknown as PrismaService,
        null,
      );
      mockPrismaService.threatLog.upsert.mockResolvedValue({});
      const partialThreat = { id: '1' } as Threat;
      await expect(repo.save(partialThreat)).resolves.not.toThrow();
      expect(mockEventDispatcher.emit).not.toHaveBeenCalled();
      expect(mockEventDispatcher.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve aplicar filtros de indicator e severity quando fornecidos', async () => {
      mockPrismaService.threatLog.findMany.mockResolvedValue([]);
      await repository.findAll({ indicator: 'test', severity: 1 });
      expect(mockPrismaService.threatLog.findMany).toHaveBeenCalledWith({
        where: { indicator: 'test', severity: 1 },
      });
    });

    it('deve aplicar apenas indicator quando severity não for fornecido', async () => {
      mockPrismaService.threatLog.findMany.mockResolvedValue([]);
      await repository.findAll({ indicator: 'ssh-scan' });
      expect(mockPrismaService.threatLog.findMany).toHaveBeenCalledWith({
        where: { indicator: 'ssh-scan' },
      });
    });

    it('deve aplicar apenas severity quando indicator não for fornecido', async () => {
      mockPrismaService.threatLog.findMany.mockResolvedValue([]);
      await repository.findAll({ severity: 2 });
      expect(mockPrismaService.threatLog.findMany).toHaveBeenCalledWith({
        where: { severity: 2 },
      });
    });

    it('deve chamar findMany com where undefined quando nenhum filtro é passado', async () => {
      mockPrismaService.threatLog.findMany.mockResolvedValue([]);
      await repository.findAll();
      expect(mockPrismaService.threatLog.findMany).toHaveBeenCalledWith({
        where: undefined,
      });
    });

    it('deve retornar array vazio quando não há registros', async () => {
      mockPrismaService.threatLog.findMany.mockResolvedValue([]);
      const result = await repository.findAll({});
      expect(result).toEqual([]);
    });

    it('deve mapear registros do prisma para domain via toDomain', async () => {
      const prismaRow = { id: 'abc', sourceIp: '10.0.0.1', severity: 2 };
      const domainThreat = { id: 'abc' } as Threat;
      mockPrismaService.threatLog.findMany.mockResolvedValue([prismaRow]);
      vi.mocked(PrismaThreatMapper.toDomain).mockReturnValue(domainThreat);
      const result = await repository.findAll({ indicator: 'test' });
      expect(PrismaThreatMapper.toDomain).toHaveBeenCalledWith(prismaRow);
      expect(result).toEqual([domainThreat]);
    });
  });

  describe('findAllPaginated', () => {
    beforeEach(() => {
      mockPrismaService.threatLog.findMany.mockResolvedValue([]);
      mockPrismaService.threatLog.count.mockResolvedValue(0);
    });

    it('deve calcular skip e take corretamente com page e limit fornecidos', async () => {
      await repository.findAllPaginated({ page: 2, limit: 5 });
      expect(mockPrismaService.threatLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('deve usar defaults page=1 e limit=10 quando não fornecidos', async () => {
      await repository.findAllPaginated({} as any);
      expect(mockPrismaService.threatLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('deve incluir severity e indicator no where quando fornecidos', async () => {
      await repository.findAllPaginated({
        page: 1,
        limit: 10,
        severity: 3,
        indicator: 'scan',
      });
      expect(mockPrismaService.threatLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: 3,
            indicator: expect.objectContaining({ contains: 'scan' }),
          }),
        }),
      );
    });

    it('deve definir severity e indicator como undefined no where quando omitidos', async () => {
      await repository.findAllPaginated({ page: 1, limit: 5 });
      expect(mockPrismaService.threatLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { severity: undefined, indicator: undefined },
        }),
      );
    });

    it('deve retornar total/page/limit corretamente', async () => {
      mockPrismaService.threatLog.count.mockResolvedValue(25);
      const result = await repository.findAllPaginated({ page: 1, limit: 10 });
      expect(result).toEqual(
        expect.objectContaining({
          total: 25,
          page: 1,
          limit: 10,
        }),
      );
    });

    it('deve mapear registros retornados pelo $transaction para domain', async () => {
      const prismaRow = { id: 'x', sourceIp: '1.1.1.1', severity: 1 };
      const domainThreat = { id: 'x' } as Threat;
      mockPrismaService.threatLog.findMany.mockResolvedValue([prismaRow]);
      mockPrismaService.threatLog.count.mockResolvedValue(1);
      vi.mocked(PrismaThreatMapper.toDomain).mockReturnValue(domainThreat);
      const result = await repository.findAllPaginated({ page: 1, limit: 10 });
      expect(PrismaThreatMapper.toDomain).toHaveBeenCalledWith(prismaRow);
      expect(result.data).toEqual([domainThreat]);
    });
  });

  describe('getAnalytics', () => {
    it('deve processar agrupamentos e retornar estrutura correta (inclui path de criticalThreats=false)', async () => {
      mockPrismaService.threatLog.count.mockResolvedValue(10);
      mockPrismaService.threatLog.groupBy
        .mockResolvedValueOnce([{ severity: 1, _count: { severity: 5 } }]) // by severity
        .mockResolvedValueOnce([
          { indicator: 'test', _count: { indicator: 5 } },
        ]) // top indicators
        .mockResolvedValueOnce([{ type: 'IP', _count: { type: 3 } }]); // by type

      (mockPrismaService.threatLog as any).findFirst = vi
        .fn()
        .mockResolvedValue({ severity: 9 });

      const result = await repository.getAnalytics();

      expect(result.totalThreats).toBe(10);
      // criticalThreats: severity>=8, mas severity=1 => 0
      expect(result.criticalThreats).toBe(0);
      expect(result.bySeverity).toEqual({ '1': 5 });
      expect(result.byType).toEqual({ IP: 3 });
      expect(result.topIndicators?.[0]).toEqual({
        indicator: 'test',
        count: 5,
        severity: 9,
      });
      expect(mockPrismaService.threatLog.groupBy).toHaveBeenCalledTimes(3);
    });

    it('deve calcular criticalThreats quando existe severidade >= 8 (cobre branch do filter)', async () => {
      mockPrismaService.threatLog.count.mockResolvedValue(10);
      mockPrismaService.threatLog.groupBy
        .mockResolvedValueOnce([
          { severity: 8, _count: { severity: 2 } },
          { severity: 10, _count: { severity: 3 } },
        ]) // by severity
        .mockResolvedValueOnce([
          { indicator: 'test', _count: { indicator: 5 } },
        ]) // top indicators
        .mockResolvedValueOnce([{ type: 'IP', _count: { type: 3 } }]); // by type

      (mockPrismaService.threatLog as any).findFirst = vi
        .fn()
        .mockResolvedValue({ severity: 9 });

      const result = await repository.getAnalytics();

      // criticalThreats = 2 + 3
      expect(result.criticalThreats).toBe(5);
    });

    it('deve cobrir piorCaso inexistente no topIndicators (worst?.severity ?? 0)', async () => {
      mockPrismaService.threatLog.count.mockResolvedValue(10);

      mockPrismaService.threatLog.groupBy
        .mockResolvedValueOnce([{ severity: 1, _count: { severity: 5 } }]) // by severity
        .mockResolvedValueOnce([
          { indicator: 'no-match', _count: { indicator: 4 } },
        ]) // top indicators
        .mockResolvedValueOnce([{ type: 'IP', _count: { type: 2 } }]); // by type

      // worst inexistente => severity deve virar 0 via nullish coalescing
      (mockPrismaService.threatLog as any).findFirst = vi
        .fn()
        .mockResolvedValue(undefined);

      const result = await repository.getAnalytics();

      expect(result.topIndicators?.[0]).toEqual({
        indicator: 'no-match',
        count: 4,
        severity: 0,
      });
    });

    it('deve usar fallback averageSeverity=0 quando totalThreats = 0', async () => {
      mockPrismaService.threatLog.count.mockResolvedValue(0);
      mockPrismaService.threatLog.groupBy
        .mockResolvedValueOnce([{ severity: 9, _count: { severity: 2 } }]) // by severity
        .mockResolvedValueOnce([
          { indicator: 'test', _count: { indicator: 1 } },
        ]) // top indicators
        .mockResolvedValueOnce([{ type: 'IP', _count: { type: 5 } }]); // by type

      (mockPrismaService.threatLog as any).findFirst = vi
        .fn()
        .mockResolvedValue({ severity: 9 });

      const result = await repository.getAnalytics();

      expect(result.totalThreats).toBe(0);
      expect(result.averageSeverity).toBe(0);
    });
  });

  describe('countByIndicator', () => {
    it('deve contar registros pelo indicator informado', async () => {
      mockPrismaService.threatLog.count.mockResolvedValue(7);
      const result = await repository.countByIndicator('Tor Exit Node');
      expect(result).toBe(7);
      expect(mockPrismaService.threatLog.count).toHaveBeenCalledWith({
        where: { indicator: 'Tor Exit Node' },
      });
    });
  });
});
