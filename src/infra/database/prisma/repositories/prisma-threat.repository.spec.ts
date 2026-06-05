import { ThreatLog as PrismaThreatLog } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Threat } from '../../../../core/domain/entities/threat.entity';
import { PrismaService } from '../prisma.service';
import { PrismaThreatRepository } from './prisma-threat.repository';

describe('PrismaThreatRepository', () => {
  const mockUpsert = vi.fn();
  const mockCount = vi.fn();
  const mockFindMany = vi.fn();

  const prismaMock = {
    threatLog: {
      upsert: mockUpsert,
      count: mockCount,
      findMany: mockFindMany,
    },
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
});
