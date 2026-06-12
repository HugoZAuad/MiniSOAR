import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

type SanitizablePayload = Record<string, unknown>;

@Injectable()
export class AuditLoggerInterceptor implements NestInterceptor {
  public readonly logger = new Logger(AuditLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Record<string, unknown>>();
    const method = (req.method as string) || 'UNKNOWN';
    const url = (req.url as string) || 'UNKNOWN';
    const ip = (req.ip as string) || '127.0.0.1';

    if (method === 'GET') return next.handle();

    const originalBody = req.body as SanitizablePayload | null | undefined;
    const sanitizedBody = this.sanitizePayload(originalBody);

    const user = req.user as { id?: string } | undefined;
    const operator = user?.id || 'ANONYMOUS_OR_SYSTEM';

    return next.handle().pipe(
      tap(() => {
        this.logger.warn(
          JSON.stringify({
            method,
            url,
            ip,
            operator,
            payload: sanitizedBody,
          }),
        );
      }),
    );
  }

  public sanitizePayload(
    payload: SanitizablePayload | null | undefined,
  ): SanitizablePayload | null {
    if (!payload || typeof payload !== 'object') return null;

    const sanitized = { ...payload };
    if ('password' in sanitized) sanitized.password = '********';
    if ('token' in sanitized) sanitized.token = '********';
    return sanitized;
  }
}
