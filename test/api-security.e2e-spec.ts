import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';
import { AppModule } from '../src/app.module';

describe('API Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('deve retornar 401 se a API Key estiver faltando', () => {
    return request(app.getHttpServer())
      .post('/threats')
      .send({ indicator: '1.1.1.1', type: 'IP', severity: 5 })
      .expect(401);
  });

  it('deve permitir acesso com a API Key correta', () => {
    return request(app.getHttpServer())
      .post('/threats')
      .set('x-api-key', process.env.API_KEY || 'MiniSOAR_Secret_Token_2026')
      .send({ indicator: '1.1.1.1', type: 'IP', severity: 5 })
      .expect(201);
  });
});
