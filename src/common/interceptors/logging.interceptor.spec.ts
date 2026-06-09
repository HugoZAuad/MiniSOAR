import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('deve logar o tempo de execução da rota com sucesso', async () => {
    const mockRequest = { method: 'GET', url: '/api/v1/threats' };
    const mockResponse = { statusCode: 200 };

    const mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
        getResponse: vi.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of('response-data')),
    } as CallHandler;

    const resultObservable = interceptor.intercept(
      mockExecutionContext,
      mockCallHandler,
    );

    await new Promise<void>((resolve) => {
      resultObservable.subscribe({
        next: () => {},
        complete: () => resolve(),
      });
    });

    expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
  });

  it('deve usar valores de fallback quando as propriedades de request e response forem nulas', async () => {
    const mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(null),
        getResponse: vi.fn().mockReturnValue(null),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of('fallback-data')),
    } as CallHandler;

    const resultObservable = interceptor.intercept(
      mockExecutionContext,
      mockCallHandler,
    );

    await new Promise<void>((resolve) => {
      resultObservable.subscribe({
        next: () => {},
        complete: () => resolve(),
      });
    });

    expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
  });
});
