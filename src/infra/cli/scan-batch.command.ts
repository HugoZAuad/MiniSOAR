import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import {
  Command,
  CommandRunner,
  InquirerService,
  Option,
} from 'nest-commander';
import * as path from 'path';
import * as readline from 'readline';
import { RegisterThreatUseCase } from '../../core/application/use-cases/register-threat.use-case';
import { IndicatorService } from '../../core/services/indicator.service';

interface ScanCommandOptions {
  file?: string;
}

interface InquirerAnswers {
  filePath: string;
}

@Command({
  name: 'scan',
  description:
    'Executa uma varredura em lote de indicadores (interativo ou via flag).',
})
export class ScanBatchCommand extends CommandRunner {
  private readonly logger = new Logger(ScanBatchCommand.name);

  constructor(
    private readonly registerThreatUseCase: RegisterThreatUseCase,
    private readonly indicatorService: IndicatorService,
    private readonly inquirer: InquirerService,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options: ScanCommandOptions,
  ): Promise<void> {
    let resolvedPath = '';

    if (!options.file) {
      this.logger.log('Modo interativo ativado...');

      const answers = await this.inquirer.ask<InquirerAnswers>(
        'scan-file-questions',
        undefined,
      );
      resolvedPath = path.resolve(answers.filePath);
    } else {
      resolvedPath = path.resolve(options.file);
      if (!fs.existsSync(resolvedPath)) {
        this.logger.error(`Arquivo não encontrado: ${resolvedPath}`);
        return;
      }
    }

    this.logger.log(`\n🚀 Iniciando varredura em: ${resolvedPath}`);

    const fileStream = fs.createReadStream(resolvedPath, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let successCount = 0;
    let errorCount = 0;

    for await (const line of rl) {
      const indicator = line.trim();
      if (!indicator || indicator.startsWith('#')) continue;

      try {
        const type = this.indicatorService.detectType(indicator);
        await this.registerThreatUseCase.execute({
          indicator,
          type,
          severity: 5,
        });
        successCount++;
      } catch (error: unknown) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`[❌] Falha em ${indicator}: ${errorMessage}`);
      }
    }

    this.logger.log(
      `\n✅ Concluído! Sucesso: ${successCount} | Falhas: ${errorCount}`,
    );
  }

  @Option({
    flags: '-f, --file <path>',
    description: 'Caminho direto para ignorar o menu interativo.',
  })
  parseFile(val: string): string {
    return val;
  }
}
