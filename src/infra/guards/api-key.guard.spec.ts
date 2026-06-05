import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockConfigService = { get: vi.fn() } as unknown as ConfigService;
    guard = new ApiKeyGuard(mockConfigService);
  });

  it('deve permitir acesso e parar a execução se o contexto NÃO for http', () => {
    const context = {
      getType: vi.fn().mockReturnValue('rpc'),
      switchToHttp: vi.fn(),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(context.switchToHttp).not.toHaveBeenCalled();
  });

  it('deve seguir o fluxo se o contexto FOR http', () => {
    vi.spyOn(mockConfigService, 'get').mockReturnValue('SECRET_KEY');

    const context = {
      getType: vi.fn().mockReturnValue('http'),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi
          .fn()
          .mockReturnValue({ headers: { 'x-api-key': 'SECRET_KEY' } }),
      }),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('deve lançar Unauthorized se systemApiKey não estiver configurada', () => {
    vi.spyOn(mockConfigService, 'get').mockReturnValue(undefined);

    const context = {
      getType: vi.fn().mockReturnValue('http'),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi
          .fn()
          .mockReturnValue({ headers: { 'x-api-key': 'KEY' } }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('deve lançar Unauthorized se a chave for inválida', () => {
    vi.spyOn(mockConfigService, 'get').mockReturnValue('SECRET_KEY');

    const context = {
      getType: vi.fn().mockReturnValue('http'),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi
          .fn()
          .mockReturnValue({ headers: { 'x-api-key': 'WRONG' } }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
