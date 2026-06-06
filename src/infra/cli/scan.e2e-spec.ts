import { CommandTestFactory } from 'nest-commander-testing';
import { TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { CommandsModule } from './commands.module';
import { RegisterThreatUseCase } from '../../core/application/use-cases/register-threat.use-case';

describe('CLI E2E: Scan Batch Command', () => {
  let commandModule: TestingModule;
  let registerUseCaseMock: Partial<RegisterThreatUseCase>;

  beforeAll(async () => {
    registerUseCaseMock = {
      execute: vi.fn().mockResolvedValue(true),
    };

    commandModule = await CommandTestFactory.createTestingCommand({
      imports: [CommandsModule],
    })
      .overrideProvider(RegisterThreatUseCase)
      .useValue(registerUseCaseMock)
      .compile();
  });

  it('deve rejeitar execução com ficheiro inválido (-f não-existe.txt)', async () => {
    await CommandTestFactory.run(commandModule, [
      'scan',
      '-f',
      'nao-existe.txt',
    ]);

    expect(registerUseCaseMock.execute).not.toHaveBeenCalled();
  });
});
