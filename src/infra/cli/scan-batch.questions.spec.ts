import * as fs from 'fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScanBatchQuestions } from './scan-batch.questions';

vi.mock('fs');

describe('ScanBatchQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve validar caminho com sucesso', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    const result = ScanBatchQuestions.validatePath('caminho/valido.txt');

    expect(result).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith('caminho/valido.txt');
  });

  it('deve rejeitar caminho vazio', () => {
    const result = ScanBatchQuestions.validatePath('   ');
    expect(result).toBe('O caminho não pode estar vazio.');
  });

  it('deve rejeitar ficheiro inexistente', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    const result = ScanBatchQuestions.validatePath('inexistente.txt');

    expect(result).toBe('Ficheiro não encontrado.');
  });

  it('deve cobrir o método parseFilePath', () => {
    const questions = new ScanBatchQuestions();
    const input = 'teste.txt';
    expect(questions.parseFilePath(input)).toBe(input);
  });

  it('deve executar a função de validação definida no decorador', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    const result = ScanBatchQuestions.validate('valido.txt');

    expect(result).toBe(true);
  });
});
