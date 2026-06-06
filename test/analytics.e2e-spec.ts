import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module';
import { THREAT_REPOSITORY_TOKEN } from '../src/core/domain/repositories/threat-repository.token';

describe('AnalyticsController (e2e)', () => {
  let app: INestApplication;
  const mockRepo = { getAnalytics: vi.fn() };

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

  it('/analytics/summary (GET)', async () => {
    interface SummaryResponse {
      totalThreats: number;
    }

    vi.mocked(mockRepo.getAnalytics).mockResolvedValue({
      totalThreats: 1,
    });

    const response = await request(app.getHttpServer()).get('/analytics/summary');

    const body = response.body as SummaryResponse;
    expect(body.totalThreats).toBe(1);
  });

  afterAll(async () => {
    await app.close();
  });
});