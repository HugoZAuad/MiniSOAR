import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IngestThreatsUseCase } from '../../../core/application/use-cases/ingest-threats.use-case';
import { IngestionController } from './ingestion.controller';

describe('IngestionController', () => {
  let controller: IngestionController;
  const mockUseCase = { execute: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        { provide: IngestThreatsUseCase, useValue: mockUseCase },
        {
          provide: ConfigService,
          useValue: { get: vi.fn().mockReturnValue('mock-key') },
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
  });

  it('deve chamar o execute com o array de threats extraído do DTO', async () => {
    const dto = {
      threats: [{ indicator: '1.1.1.1', type: 'IP', severity: 1 }],
    };
    await controller.ingest(dto);
    expect(mockUseCase.execute).toHaveBeenCalledWith(dto.threats);
  });
});
