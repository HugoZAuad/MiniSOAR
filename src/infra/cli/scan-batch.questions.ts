import * as fs from 'fs';
import { Question, QuestionSet } from 'nest-commander';

@QuestionSet({ name: 'scan-file-questions' })
export class ScanBatchQuestions {
  static validatePath(value: string): string | boolean {
    if (!value || value.trim() === '') {
      return 'O caminho não pode estar vazio.';
    }
    if (!fs.existsSync(value)) {
      return 'Ficheiro não encontrado.';
    }
    return true;
  }

  static readonly validate = (value: string): string | boolean => {
    return ScanBatchQuestions.validatePath(value);
  };

  @Question({
    message: 'Qual o caminho do ficheiro de indicadores?',
    name: 'filePath',
    type: 'input',
    validate: ScanBatchQuestions.validate,
  })
  parseFilePath(val: string): string {
    return val;
  }
}
