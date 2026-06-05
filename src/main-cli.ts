import { CommandFactory } from 'nest-commander';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.colorize(),
          winston.format.printf((info) => {
            const ctx = typeof info.context === 'string' ? info.context : 'CLI';
            return `[SOAR-CLI] ${String(info.timestamp)} [${ctx}] ${String(info.level)}: ${String(info.message)}`;
          }),
        ),
      }),
      new winston.transports.DailyRotateFile({
        dirname: 'logs',
        filename: 'soar-cli-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '10m',
        maxFiles: '7d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  });

  await CommandFactory.run(AppModule, logger);
}
void bootstrap();
