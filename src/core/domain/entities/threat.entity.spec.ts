import { describe, expect, it } from 'vitest';
import { Threat } from './threat.entity';

describe('Threat Entity', () => {
  it('should create a threat with valid data', () => {
    const threat = new Threat('192.168.1.1', 'IP', 5);

    expect(threat.id).toBeDefined();
    expect(threat.indicator).toBe('192.168.1.1');
    expect(threat.type).toBe('IP');
    expect(threat.severity).toBe(5);
    expect(threat.hybridScore).toBe(5);
    expect(threat.recurrencyCount).toBe(0);
  });

  it('should throw an error if severity is less than 1', () => {
    expect(() => new Threat('192.168.1.1', 'IP', 0)).toThrow(
      'Severity must be between 1 and 10',
    );
  });

  it('should throw an error if severity is greater than 10', () => {
    expect(() => new Threat('192.168.1.1', 'IP', 11)).toThrow(
      'Severity must be between 1 and 10',
    );
  });

  it('should return true if it is a high risk threat', () => {
    const threat = new Threat('1.1.1.1', 'IP', 8);
    expect(threat.isHighRisk()).toBe(true);
  });

  it('should return false if it is not a high risk threat', () => {
    const threat = new Threat('1.1.1.1', 'IP', 7);
    expect(threat.isHighRisk()).toBe(false);
  });

  describe('Enrichment and Hybrid Scoring', () => {
    it('should enrich threat data and calculate hybrid score correctly', () => {
      const threat = new Threat('192.168.1.1', 'IP', 5);

      threat.enrich({
        country: 'BR',
        reputationScore: 50,
        recurrencyCount: 2,
      });

      expect(threat.country).toBe('BR');
      expect(threat.reputationScore).toBe(50);
      expect(threat.recurrencyCount).toBe(2);
      expect(threat.hybridScore).toBe(7.5);
    });

    it('should fall back to existing values if enrichment fields are undefined', () => {
      const threat = new Threat('192.168.1.1', 'IP', 5);

      threat.enrich({
        country: 'BR',
        reputationScore: 40,
        recurrencyCount: 1,
      });

      threat.enrich({});

      expect(threat.country).toBe('BR');
      expect(threat.reputationScore).toBe(40);
      expect(threat.recurrencyCount).toBe(1);
    });

    it('should apply a maximum cap of 2 on recurrency weight', () => {
      const threat = new Threat('192.168.1.1', 'IP', 5);

      threat.enrich({
        recurrencyCount: 10,
      });

      expect(threat.hybridScore).toBe(7);
    });

    it('should apply a maximum cap of 10 on total hybrid score', () => {
      const threat = new Threat('192.168.1.1', 'IP', 9);

      threat.enrich({
        reputationScore: 100,
        recurrencyCount: 4,
      });

      expect(threat.hybridScore).toBe(10);
    });

    it('should update risk status dynamically if hybrid score crosses the threshold', () => {
      const threat = new Threat('192.168.1.1', 'IP', 6);
      expect(threat.isHighRisk()).toBe(false);

      threat.enrich({
        reputationScore: 80,
      });

      expect(threat.isHighRisk()).toBe(true);
    });
  });
});
