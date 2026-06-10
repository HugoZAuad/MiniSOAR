/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditLoggerInterceptor } from './audit-logger.interceptor';

type SanitizablePayload = Record<string, unknown>;

function makeContext(overrides: {
  method: string | undefined;
  url?: string | null;
  body?: SanitizablePayload;
  ip?: string | undefined;
  user?: { id: string };
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        method: overrides.method,
        url: overrides.url ?? '/test',
        body: overrides.body ?? {},
        ip: overrides.ip ?? '127.0.0.1',
        user: overrides.user,
      }),
      getResponse: () => ({}),
    }),
  } as unknown as ExecutionContext;
}

describe('AuditLoggerInterceptor', () => {
  let interceptor: AuditLoggerInterceptor;
  let mockNext: CallHandler;

  beforeEach(() => {
    interceptor = new AuditLoggerInterceptor();
    mockNext = { handle: () => of(null) };
  });

  it('deve usar valores fallback quando method, url ou ip estão ausentes', async () => {
    const loggerSpy = vi.spyOn(interceptor['logger'], 'warn');

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: undefined,
          url: null,
          ip: undefined,
        }),
      }),
    } as unknown as ExecutionContext;

    await interceptor.intercept(ctx, mockNext).toPromise();

    expect(loggerSpy).toHaveBeenCalled();
    const logPayload = JSON.parse(loggerSpy.mock.calls[0][0] as string);

    expect(logPayload.method).toBe('UNKNOWN');
    expect(logPayload.url).toBe('UNKNOWN');
    expect(logPayload.ip).toBe('127.0.0.1');
  });

  it('deve retornar null se o payload for um tipo primitivo (ex: number)', () => {
    expect(interceptor.sanitizePayload(123 as any)).toBeNull();
  });

  it('deve logar com userId do request.user quando presente', async () => {
    const loggerSpy = vi.spyOn(interceptor['logger'], 'warn');
    const ctx = makeContext({
      method: 'POST',
      url: '/api/resource',
      body: { data: 'value' },
      ip: '10.0.0.1',
      user: { id: 'user-123' },
    });

    await interceptor.intercept(ctx, mockNext).toPromise();

    expect(loggerSpy).toHaveBeenCalled();
    const logPayload = JSON.parse(
      loggerSpy.mock.calls[0][0] as string,
    ) as Record<string, unknown>;
    expect(logPayload['operator']).toBe('user-123');
  });

  it('deve logar com ANONYMOUS_OR_SYSTEM quando request.user não existe', async () => {
    const loggerSpy = vi.spyOn(interceptor['logger'], 'warn');
    const ctx = makeContext({
      method: 'DELETE',
      url: '/api/resource/1',
      body: {},
      ip: '10.0.0.2',
    });

    await interceptor.intercept(ctx, mockNext).toPromise();

    expect(loggerSpy).toHaveBeenCalled();
    const logPayload = JSON.parse(
      loggerSpy.mock.calls[0][0] as string,
    ) as Record<string, unknown>;
    expect(logPayload['operator']).toBe('ANONYMOUS_OR_SYSTEM');
  });

  it('deve logar para todos os métodos mutáveis: POST, PUT, PATCH, DELETE', async () => {
    const loggerSpy = vi.spyOn(interceptor['logger'], 'warn');

    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      await interceptor
        .intercept(makeContext({ method, body: { password: '123' } }), mockNext)
        .toPromise();
    }

    expect(loggerSpy).toHaveBeenCalledTimes(4);
  });

  it('não deve logar para método GET', async () => {
    const loggerSpy = vi.spyOn(interceptor['logger'], 'warn');
    await interceptor
      .intercept(makeContext({ method: 'GET' }), mockNext)
      .toPromise();
    expect(loggerSpy).not.toHaveBeenCalled();
  });

  it('deve mascarar campo password no payload', () => {
    const result = interceptor.sanitizePayload({
      username: 'admin',
      password: 'secret123',
    });
    expect(result?.['password']).toBe('********');
    expect(result?.['username']).toBe('admin');
  });

  it('deve mascarar campo token no payload', () => {
    const result = interceptor.sanitizePayload({
      action: 'login',
      token: 'jwt.token.here',
    });
    expect(result?.['token']).toBe('********');
    expect(result?.['action']).toBe('login');
  });

  it('deve retornar payload sem alterações quando não há dados sensíveis', () => {
    const payload = { username: 'admin', role: 'admin' };
    const result = interceptor.sanitizePayload(payload);
    expect(result).toEqual(payload);
  });

  it('deve retornar null se o payload for nulo', () => {
    expect(interceptor.sanitizePayload(null)).toBeNull();
  });

  it('deve retornar null se o payload for undefined', () => {
    expect(interceptor.sanitizePayload(undefined)).toBeNull();
  });
});
