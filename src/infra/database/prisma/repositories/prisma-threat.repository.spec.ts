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

    it('deve retornar meta com totalPages calculado corretamente', async () => {
      mockPrismaService.threatLog.count.mockResolvedValue(25);
      const result = await repository.findAllPaginated({ page: 1, limit: 10 });
      expect(result.meta).toEqual({
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      });
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
    it('deve processar agrupamentos por severidade e retornar estrutura correta', async () => {
      mockPrismaService.threatLog.count.mockResolvedValue(10);
      mockPrismaService.threatLog.groupBy
        .mockResolvedValueOnce([{ severity: 1, _count: { severity: 5 } }])
        .mockResolvedValueOnce([
          { indicator: 'test', _count: { indicator: 5 } },
        ]);
      const result = await repository.getAnalytics();
      expect(result.totalThreats).toBe(10);
      expect(result.bySeverity[0]).toEqual({ level: 1, count: 5 });
      expect(result.topIndicators[0]).toEqual({ indicator: 'test', count: 5 });
      expect(mockPrismaService.threatLog.groupBy).toHaveBeenCalledTimes(2);
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
