import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { Command, CommandRunner, Option } from 'nest-commander';
import * as path from 'path';
import * as readline from 'readline';
import { RegisterThreatUseCase } from '../../core/application/use-cases/register-threat.use-case';

interface ScanCommandOptions {
  file?: string;
}

@Command({
  name: 'scan',
  description:
    'Executa uma varredura em lote de indicadores de ameaça a partir de um arquivo de logs.',
})
export class ScanBatchCommand extends CommandRunner {
  private readonly logger = new Logger(ScanBatchCommand.name);

  constructor(private readonly registerThreatUseCase: RegisterThreatUseCase) {
    super();
  }

  async run(
    passedParams: string[],
    options: ScanCommandOptions,
  ): Promise<void> {
    if (!options.file) {
      this.logger.error(
        'Erro: Você precisa especificar o caminho do arquivo usando a flag -f ou --file',
      );
      return;
    }

    const resolvedPath = path.resolve(options.file);

    if (!fs.existsSync(resolvedPath)) {
      this.logger.error(
        `Arquivo não encontrado no caminho especificado: ${resolvedPath}`,
      );
      return;
    }

    this.logger.log(
      `🚨 Inicializando varredura tática via Stream no arquivo: ${resolvedPath}`,
    );

    let totalLines = 0;
    let successCount = 0;
    let failureCount = 0;
    const startTime = Date.now();

    const fileStream = fs.createReadStream(resolvedPath, { encoding: 'utf8' });

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      totalLines++;
      const indicator = line.trim();

      if (!indicator || indicator.startsWith('#')) {
        continue;
      }

      try {
        const type = this.detectIndicatorType(indicator);

        await this.registerThreatUseCase.execute({
          indicator,
          type,
          severity: 5,
        });

        successCount++;
        this.logger.log(`[✔] Processado com sucesso: ${indicator} (${type})`);
      } catch (error: unknown) {
        failureCount++;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `[❌] Falha ao processar indicador na linha ${totalLines} (${indicator}): ${errorMessage}`,
        );
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    this.logger.log(`\n======================================================`);
    this.logger.log(`📊 RELATÓRIO FINAL DE VARREDURA EM LOTE`);
    this.logger.log(`⏱️  Tempo de Execução: ${duration}s`);
    this.logger.log(`📝 Total de Linhas Analisadas: ${totalLines}`);

    if (successCount > 0) {
      this.logger.log(`🟢 Indicadores Ingeridos/Enriquecidos: ${successCount}`);
    }
    if (failureCount > 0) {
      this.logger.warn(`🔴 Indicadores com Falha: ${failureCount}`);
    }
    this.logger.log(`======================================================\n`);
  }

  @Option({
    flags: '-f, --file <path>',
    description:
      'Caminho absoluto ou relativo para o arquivo de texto/logs contendo os indicadores.',
  })
  parseFilePath(val: string): string {
    return val;
  }

  private detectIndicatorType(indicator: string): 'IP' | 'DOMAIN' | 'HASH' {
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(indicator)) return 'IP';

    if (indicator.length === 32 || indicator.length === 64) return 'HASH';

    return 'DOMAIN';
  }
}
