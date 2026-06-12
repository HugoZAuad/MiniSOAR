import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpExceptionFilter } from './http-exception.filter';

const mockStatus = vi.fn().mockReturnThis();
const mockJson = vi.fn();

const mockGetResponse = {
  status: mockStatus,
  json: mockJson,
} as unknown as Response;

const mockRequest = { url: '/test' } as Request;

const mockHost = {
  switchToHttp: () => ({
    getResponse: () => mockGetResponse,
    getRequest: () => mockRequest,
  }),
} as unknown as ArgumentsHost;

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    vi.clearAllMocks();
  });

  it('deve formatar erro genérico (não-HttpException) como 500', () => {
    filter.catch(new Error('Unexpected crash'), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Error',
        path: '/test',
      }),
    );
  });

  it('deve extrair error e message quando exceptionResponse é um objeto com ambos', () => {
    filter.catch(
      new HttpException(
        { error: 'Forbidden', message: 'Acesso negado' },
        HttpStatus.FORBIDDEN,
      ),
      mockHost,
    );

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Acesso negado',
      }),
    );
  });

  it('deve lidar com exceptionResponse como objeto sem chave error', () => {
    filter.catch(
      new HttpException({ message: 'Not Found' }, HttpStatus.NOT_FOUND),
      mockHost,
    );

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, message: 'Not Found' }),
    );
  });

  it('deve formatar erro quando exceptionResponse é uma string simples', () => {
    const exception = new HttpException('Erro de validação', 400);
    vi.spyOn(exception, 'getResponse').mockReturnValue('Erro de validação');

    filter.catch(exception, mockHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Erro de validação',
        error: 'Internal Error',
      }),
    );
  });

  it('deve tratar exceptionResponse null como fallback', () => {
    const exception = new HttpException('', 422);
    vi.spyOn(exception, 'getResponse').mockReturnValue(
      null as unknown as string,
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(422);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 422,
        error: 'Internal Error',
        message: null,
      }),
    );
  });

  it('deve lidar com exception não sendo Error como desconhecido (branch else de Error)', () => {
    // booleanamente não é instanceof Error
    filter.catch('boom', mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        error: 'Internal Error',
        message: 'Internal server error',
        path: '/test',
      }),
    );
  });

  it('deve sempre incluir timestamp e path na resposta', () => {
    filter.catch(new Error('qualquer'), mockHost);

    const call = mockJson.mock.calls[0][0] as Record<string, unknown>;
    expect(call['timestamp']).toBeDefined();
    expect(call['path']).toBe('/test');
  });
});
