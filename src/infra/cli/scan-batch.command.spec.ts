import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { InquirerService } from 'nest-commander';
import * as readline from 'readline';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
  type Mocked,
} from 'vitest';
import { RegisterThreatUseCase } from '../../core/application/use-cases/register-threat.use-case';
import { IndicatorService } from '../../core/services/indicator.service';
import { ScanBatchCommand } from './scan-batch.command';

vi.mock('fs');
vi.mock('readline');

describe('ScanBatchCommand', () => {
  let command: ScanBatchCommand;
  let registerUseCaseMock: Mocked<RegisterThreatUseCase>;
  let indicatorServiceMock: Mocked<IndicatorService>;
  let inquirerMock: Mocked<InquirerService>;

  beforeEach(async () => {
    const mockRegisterUseCase = { execute: vi.fn() };
    const mockIndicatorService = {
      detectType: vi.fn().mockReturnValue('DOMAIN'),
    };
    const mockInquirer = { ask: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanBatchCommand,
        { provide: RegisterThreatUseCase, useValue: mockRegisterUseCase },
        { provide: IndicatorService, useValue: mockIndicatorService },
        { provide: InquirerService, useValue: mockInquirer },
      ],
    }).compile();

    command = module.get<ScanBatchCommand>(ScanBatchCommand);
    registerUseCaseMock = module.get(RegisterThreatUseCase);
    indicatorServiceMock = module.get(IndicatorService);
    inquirerMock = module.get(InquirerService);

    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve processar o ficheiro a partir da flag --file', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'createReadStream').mockReturnValue({} as fs.ReadStream);

    const mockReadline = {
      [Symbol.asyncIterator]: () => ({
        next: vi
          .fn()
          .mockResolvedValueOnce({ value: 'evil.com', done: false })
          .mockResolvedValueOnce({ done: true }),
      }),
    };
    (readline.createInterface as Mock).mockReturnValue(mockReadline);

    await command.run([], { file: './teste.txt' });

    expect(registerUseCaseMock.execute).toHaveBeenCalledTimes(1);
    expect(registerUseCaseMock.execute).toHaveBeenCalledWith(
      expect.objectContaining({ indicator: 'evil.com' }),
    );

    expect(indicatorServiceMock.detectType).toHaveBeenCalledWith('evil.com');
  });

  it('deve acionar o Inquirer se nenhuma flag for passada', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    (readline.createInterface as Mock).mockReturnValue({
      [Symbol.asyncIterator]: () => ({ next: () => ({ done: true }) }),
    });

    inquirerMock.ask.mockResolvedValue({ filePath: './interativo.txt' });

    await command.run([], {});

    expect(inquirerMock.ask).toHaveBeenCalledWith(
      'scan-file-questions',
      undefined,
    );
  });

  it('deve parar a execução se o ficheiro não existir', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    await command.run([], { file: './nao-existe.txt' });

    expect(readline.createInterface).not.toHaveBeenCalled();
    expect(registerUseCaseMock.execute).not.toHaveBeenCalled();
  });

  it('deve tratar e contabilizar erros lançados pelo UseCase', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    const mockReadline = {
      [Symbol.asyncIterator]: () => ({
        next: vi
          .fn()
          .mockResolvedValueOnce({ value: 'bad.com', done: false })
          .mockResolvedValueOnce({ done: true }),
      }),
    };
    (readline.createInterface as Mock).mockReturnValue(mockReadline);

    registerUseCaseMock.execute.mockRejectedValue(new Error('Falha no DB'));

    await command.run([], { file: './teste.txt' });

    const loggerErrorSpy = vi.spyOn(Logger.prototype, 'error');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[❌] Falha em bad.com'),
    );
  });

  it('deve testar o parseFile do Option', () => {
    expect(command.parseFile('caminho/teste.txt')).toBe('caminho/teste.txt');
  });

  it('deve ignorar linhas vazias ou comentários e continuar processamento', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    const mockReadline = {
      [Symbol.asyncIterator]: () => ({
        next: vi
          .fn()
          .mockResolvedValueOnce({ value: '   ', done: false })
          .mockResolvedValueOnce({ value: '# comentário', done: false })
          .mockResolvedValueOnce({ value: 'valid.com', done: false })
          .mockResolvedValueOnce({ done: true }),
      }),
    };
    (readline.createInterface as Mock).mockReturnValue(mockReadline);

    await command.run([], { file: './teste.txt' });

    expect(registerUseCaseMock.execute).toHaveBeenCalledTimes(1);
    expect(registerUseCaseMock.execute).toHaveBeenCalledWith(
      expect.objectContaining({ indicator: 'valid.com' }),
    );
  });

  it('deve tratar erros que não são instâncias de Error', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    const mockReadline = {
      [Symbol.asyncIterator]: () => ({
        next: vi
          .fn()
          .mockResolvedValueOnce({ value: 'bad.com', done: false })
          .mockResolvedValueOnce({ done: true }),
      }),
    };
    (readline.createInterface as Mock).mockReturnValue(mockReadline);

    registerUseCaseMock.execute.mockRejectedValue('Erro crítico');

    await command.run([], { file: './teste.txt' });

    const loggerErrorSpy = vi.spyOn(Logger.prototype, 'error');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[❌] Falha em bad.com: Erro crítico'),
    );
  });
});
