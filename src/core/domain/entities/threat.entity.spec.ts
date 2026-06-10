import { Threat } from './threat.entity';

describe('Threat Entity', () => {
  describe('Constructor and Validation', () => {
    it('deve criar uma Threat com valores padrão quando propriedades opcionais não forem fornecidas', () => {
      const threat = new Threat('1.1.1.1', 'IP');

      expect(threat.id).toBeDefined();
      expect(threat.indicator).toBe('1.1.1.1');
      expect(threat.type).toBe('IP');
      expect(threat.severity).toBe(1);
      expect(threat.hybridScore).toBe(1);
      expect(threat.createdAt).toBeInstanceOf(Date);
      expect(threat.recurrencyCount).toBe(0);
    });

    it('deve criar uma Threat com todos os valores fornecidos explicitamente no construtor', () => {
      const customDate = new Date('2026-01-01');
      const threat = new Threat(
        'example.com',
        'DOMAIN',
        5,
        customDate,
        'custom-uuid-123',
      );

      expect(threat.id).toBe('custom-uuid-123');
      expect(threat.severity).toBe(5);
      expect(threat.createdAt).toBe(customDate);
    });

    it('deve lançar erro se a severidade for menor que 1', () => {
      expect(() => new Threat('1.1.1.1', 'IP', 0)).toThrow(
        'Severity must be between 1 and 10',
      );

      expect(() => new Threat('1.1.1.1', 'IP', -5)).toThrow(
        'Severity must be between 1 and 10',
      );
    });

    it('deve lançar erro se a severidade for maior que 10', () => {
      expect(() => new Threat('1.1.1.1', 'IP', 11)).toThrow(
        'Severity must be between 1 and 10',
      );
    });
  });

  describe('Factory Method (create)', () => {
    it('deve criar via factory sem propriedades de enriquecimento (Cobre todas falsas no ||)', () => {
      const threat = Threat.create({ indicator: '10.0.0.1', type: 'IP' });

      expect(threat.indicator).toBe('10.0.0.1');
      expect(threat.country).toBeUndefined();
      expect(threat.reputationScore).toBeUndefined();
    });

    it('deve enriquecer via factory apenas se recurrencyCount for fornecido (Cobre A do ||)', () => {
      const threat = Threat.create({
        indicator: '10.0.0.1',
        type: 'IP',
        recurrencyCount: 2,
      });
      expect(threat.recurrencyCount).toBe(2);
      expect(threat.reputationScore).toBeUndefined();
    });

    it('deve enriquecer via factory apenas se reputationScore for fornecido (Cobre B do ||)', () => {
      const threat = Threat.create({
        indicator: '10.0.0.1',
        type: 'IP',
        reputationScore: 50,
      });
      expect(threat.reputationScore).toBe(50);
      expect(threat.recurrencyCount).toBe(0);
    });

    it('deve enriquecer via factory apenas se country for fornecido (Cobre C do ||)', () => {
      const threat = Threat.create({
        indicator: '10.0.0.1',
        type: 'IP',
        country: 'BR',
      });
      expect(threat.country).toBe('BR');
      expect(threat.reputationScore).toBeUndefined();
    });

    it('deve criar via factory executando com todas as propriedades de enriquecimento', () => {
      const threat = Threat.create({
        indicator: 'malicious.com',
        type: 'DOMAIN',
        severity: 7,
        country: 'RU',
        reputationScore: 85,
        recurrencyCount: 3,
      });

      expect(threat.country).toBe('RU');
      expect(threat.reputationScore).toBe(85);
      expect(threat.recurrencyCount).toBe(3);
    });
  });

  describe('Enrichment and Scoring', () => {
    it('deve manter os valores atuais em enrich() se a propriedade for undefined no payload (Cobre fallback do ??)', () => {
      const threat = new Threat('1.1.1.1', 'IP', 5);
      threat.country = 'US';
      threat.reputationScore = 50;
      threat.recurrencyCount = 5;

      threat.enrich({});

      expect(threat.country).toBe('US');
      expect(threat.reputationScore).toBe(50);
      expect(threat.recurrencyCount).toBe(5);
    });

    it('deve atualizar propriedades individuais deixando o resto intacto', () => {
      const threat = new Threat('1.1.1.1', 'IP', 5);

      threat.enrich({ country: 'BR' });
      expect(threat.country).toBe('BR');
      expect(threat.recurrencyCount).toBe(0);
    });

    it('deve calcular reputationWeight como 0 se reputationScore for undefined (Cobre branch do ternário)', () => {
      const threat = new Threat('1.1.1.1', 'IP', 5);

      threat.enrich({ recurrencyCount: 2 });

      expect(threat.hybridScore).toBe(6);
    });

    it('deve calcular recurrencyWeight corretamente e limitar a contribuição máxima a 2', () => {
      const threat = new Threat('1.1.1.1', 'IP', 5);

      threat.enrich({ recurrencyCount: 10 });

      expect(threat.hybridScore).toBe(7);
    });

    it('deve limitar o hybridScore máximo global a 10', () => {
      const threat = new Threat('1.1.1.1', 'IP', 9);

      threat.enrich({ reputationScore: 100, recurrencyCount: 5 });

      expect(threat.hybridScore).toBe(10);
    });
  });

  describe('isHighRisk', () => {
    it('deve retornar false quando hybridScore for estritamente menor que 8', () => {
      const threat = new Threat('1.1.1.1', 'IP', 7);
      expect(threat.isHighRisk()).toBe(false);
    });

    it('deve retornar true quando hybridScore for igual a 8', () => {
      const threat = new Threat('1.1.1.1', 'IP', 8);
      expect(threat.isHighRisk()).toBe(true);
    });

    it('deve retornar true quando hybridScore for maior que 8', () => {
      const threat = new Threat('1.1.1.1', 'IP', 10);
      expect(threat.isHighRisk()).toBe(true);
    });
  });
});
