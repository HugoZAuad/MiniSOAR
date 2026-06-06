import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module';
import { THREAT_REPOSITORY_TOKEN } from '../src/core/domain/repositories/threat-repository.token';

describe('ThreatController - History (e2e)', () => {
  let app: INestApplication;
  
  const mockRepo = {
    findAllPaginated: vi.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(THREAT_REPOSITORY_TOKEN)
      .useValue(mockRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/threats/history (GET) - deve retornar dados paginados', async () => {
    const mockResponse = {
      data: [{ id: '1', indicator: '1.1.1.1' }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    
    mockRepo.findAllPaginated.mockResolvedValue(mockResponse);

    const response = await request(app.getHttpServer())
      .get('/threats/history?page=1&limit=10')
      .expect(200);

    expect(response.body).toEqual(mockResponse);
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      severity: undefined,
      indicator: undefined,
    });
  });

  it('/threats/history (GET) - deve filtrar por severidade', async () => {
    mockRepo.findAllPaginated.mockResolvedValue({ data: [], meta: {} });

    await request(app.getHttpServer())
      .get('/threats/history?severity=5')
      .expect(200);

    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 5 }),
    );
  });

  afterAll(async () => {
    await app.close();
  });
});