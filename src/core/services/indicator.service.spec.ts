import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { IndicatorService } from './indicator.service';

describe('IndicatorService', () => {
  let service: IndicatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndicatorService],
    }).compile();

    service = module.get<IndicatorService>(IndicatorService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('detectType', () => {
    it('deve detetar um IP válido', () => {
      expect(service.detectType('192.168.1.1')).toBe('IP');
      expect(service.detectType('10.0.0.255')).toBe('IP');
    });

    it('deve detetar um Hash MD5 (32 caracteres)', () => {
      const md5 = 'd41d8cd98f00b204e9800998ecf8427e';
      expect(service.detectType(md5)).toBe('HASH');
    });

    it('deve detetar um Hash SHA-256 (64 caracteres)', () => {
      const sha256 =
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      expect(service.detectType(sha256)).toBe('HASH');
    });

    it('deve retornar DOMAIN por padrão para outros formatos', () => {
      expect(service.detectType('malicious-domain.com')).toBe('DOMAIN');
      expect(service.detectType('random-string')).toBe('DOMAIN');
    });
  });
});
