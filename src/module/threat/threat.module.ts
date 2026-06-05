import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { PrismaThreatRepository } from '../../infra/database/prisma/repositories/prisma-threat.repository';
import { RegisterThreatUseCase } from '../../core/application/use-cases/register-threat.use-case';
import { ThreatController } from '../../infra/http/controllers/threat.controller';
import { THREAT_REPOSITORY_TOKEN } from '../../core/domain/repositories/threat-repository.token';

@Module({
  imports: [DatabaseModule],
  controllers: [ThreatController],
  providers: [
    {
      provide: THREAT_REPOSITORY_TOKEN,
      useClass: PrismaThreatRepository,
    },
    {
      provide: RegisterThreatUseCase,
      useFactory: (repo) => new RegisterThreatUseCase(repo),
      inject: [THREAT_REPOSITORY_TOKEN],
    },
  ],
})
export class ThreatModule {}