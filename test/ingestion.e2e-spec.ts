import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';
import { AppModule } from '../src/app.module';

describe('IngestionController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); 
    await app.init();
  });

  it('/ingestion/stream (POST) - deve rejeitar payload inválido', async () => {
    return request(app.getHttpServer())
      .post('/ingestion/stream')
      .set('x-api-key', process.env.API_KEY || 'test-key')
      .send({ threats: [{ indicator: 'invalid' }] }) 
      .expect(400);
  });

  it('/ingestion/stream (POST) - deve processar batch com sucesso', async () => {
    return request(app.getHttpServer())
      .post('/ingestion/stream')
      .set('x-api-key', process.env.API_KEY || 'test-key')
      .send({
        threats: [{ indicator: '1.1.1.1', type: 'IP', severity: 3 }],
      })
      .expect(201);
  });
});