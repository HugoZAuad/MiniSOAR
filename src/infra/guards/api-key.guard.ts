import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKeyHeader = request.headers['x-api-key'] as string | undefined;

    const systemApiKey = this.configService.get<string>('API_KEY');

    if (!systemApiKey) {
      throw new UnauthorizedException(
        'Configuração de segurança pendente no servidor.',
      );
    }

    if (apiKeyHeader !== systemApiKey) {
      throw new UnauthorizedException(
        'Chave de API inválida ou não fornecida.',
      );
    }

    return true;
  }
}
