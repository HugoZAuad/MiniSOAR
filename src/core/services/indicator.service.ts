import { Injectable } from '@nestjs/common';

@Injectable()
export class IndicatorService {
  detectType(indicator: string): 'IP' | 'DOMAIN' | 'HASH' {
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(indicator)) return 'IP';

    if (indicator.length === 32 || indicator.length === 64) return 'HASH';

    return 'DOMAIN';
  }
}
