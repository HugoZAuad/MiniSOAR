import { ThreatLog as PrismaThreatLog } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Threat } from '../../../../core/domain/entities/threat.entity';
import { PrismaService } from '../prisma.service';
import { PrismaThreatRepository } from './prisma-threat.repository';

describe('PrismaThreatRepository', () => {
  const mockUpsert = vi.fn();
  const mockCount = vi.fn();
  const mockFindMany = vi.fn();
  const mockGroupBy = vi.fn();
  const mockTransaction = vi.fn();

  const prismaMock = {
    threatLog: {
      upsert: mockUpsert,
      count: mockCount,
      findMany: mockFindMany,
      groupBy: mockGroupBy,
    },
    $transaction: mockTransaction,
  } as unknown as PrismaService;

  let repository: PrismaThreatRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new PrismaThreatRepository(prismaMock);
  });

  it('deve salvar uma ameaca executando o upsert no prisma', async () => {
    const threat = new Threat('1.1.1.1', 'IP', 3);
    mockUpsert.mockResolvedValueOnce({});

    await repository.save(threat);

    expect(mockUpsert).toHaveBeenCalledTimes(1);
  });

  it('deve contar os registros por indicador', async () => {
    mockCount.mockResolvedValueOnce(5);

    const count = await repository.countByIndicator('1.1.1.1');

    expect(count).toBe(5);
    expect(mockCount).toHaveBeenCalledWith({
      where: { indicator: '1.1.1.1' },
    });
  });

  it('deve retornar todas as ameacas mapeadas para o dominio', async () => {
    const rawLog: PrismaThreatLog = {
      id: 'any-id',
      indicator: '1.1.1.1',
      type: 'IP',
      severity: 3,
      country: 'BR',
      reputationScore: 50,
      recurrencyCount: 1,
      hybridScore: 5.5,
      createdAt: new Date(),
    };

    mockFindMany.mockResolvedValueOnce([rawLog]);

    const result = await repository.findAll();

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Threat);
    expect(result[0].indicator).toBe('1.1.1.1');
  });

  it('deve buscar ameaças aplicando filtro de indicador', async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await repository.findAll({ indicator: '1.1.1.1' });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { indicator: '1.1.1.1' },
    });
  });

  it('deve buscar ameaças aplicando filtro de severidade', async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await repository.findAll({ severity: 5 });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { severity: 5 },
    });
  });

  it('deve buscar analytics de ameaças', async () => {
    mockCount.mockResolvedValueOnce(10);
    mockGroupBy
      .mockResolvedValueOnce([{ severity: 1, _count: { severity: 5 } }])
      .mockResolvedValueOnce([
        { indicator: '1.1.1.1', _count: { indicator: 2 } },
      ]);

    const result = await repository.getAnalytics();

    expect(result.totalThreats).toBe(10);
    expect(result.bySeverity).toEqual([{ level: 1, count: 5 }]);
    expect(result.topIndicators).toEqual([{ indicator: '1.1.1.1', count: 2 }]);
  });

  it('deve buscar ameaças paginadas', async () => {
    const rawLog: any = {
      id: '1',
      indicator: '1.1.1.1',
      type: 'IP',
      severity: 1,
    };
    mockTransaction.mockResolvedValueOnce([[rawLog], 1]);

    const result = await repository.findAllPaginated({
      page: 1,
      limit: 10,
      severity: 1,
      indicator: '1.1.1.1',
    });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it('deve buscar ameaças paginadas sem filtros', async () => {
    const rawLog: any = {
      id: '1',
      indicator: '1.1.1.1',
      type: 'IP',
      severity: 1,
    };

    mockTransaction.mockResolvedValueOnce([[rawLog], 1]);

    await repository.findAllPaginated({
      page: 1,
      limit: 10,
    });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { severity: undefined, indicator: undefined },
      }),
    );

    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { severity: undefined, indicator: undefined },
      }),
    );

    expect(mockTransaction).toHaveBeenCalled();
  });
});
