import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetThreatAnalyticsUseCase } from '../../../core/application/use-cases/get-threat-analytics.use-case';
import { AnalyticsController } from './analytics.controller';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  const mockUseCase = { execute: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: GetThreatAnalyticsUseCase, useValue: mockUseCase },
        {
          provide: ConfigService,
          useValue: { get: vi.fn().mockReturnValue('mock-key') },
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('deve chamar o execute e retornar dados', async () => {
    mockUseCase.execute.mockResolvedValue({ total: 10 });
    const result = await controller.getAnalytics();
    expect(result).toEqual({ total: 10 });
  });
});
