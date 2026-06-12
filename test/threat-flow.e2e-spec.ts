import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/database/prisma/prisma.service';

describe('Fluxo Integrado do SOC: Ingestão -> Auditoria -> Playbook (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Mantém o banco limpo após o término do teste
    await prisma.threatLog.deleteMany({
      where: { indicator: '198.51.100.45' },
    });
    await app.close();
  });

  it('POST /api/v1/threats -> Deve executar a cadeia completa de segurança', async () => {
    const payload = {
      id: 'e2e-threat-id-01',
      indicator: '198.51.100.45',
      severity: 5,
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/threats')
      .send(payload)
      .expect(201);

    expect(response.body).toBeDefined();

    // Confirma a persistência correta via banco
    const savedLog = await prisma.threatLog.findUnique({
      where: { id: payload.id },
    });
    expect(savedLog).toBeTruthy();
    expect(savedLog?.severity).toBe(5);
  });
});
