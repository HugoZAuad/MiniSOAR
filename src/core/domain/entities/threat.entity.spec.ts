import { describe, expect, it } from 'vitest';
import { Threat } from './threat.entity';

describe('Threat Entity', () => {
  it('should create a threat with valid data', () => {
    const threat = new Threat('192.168.1.1', 'IP', 5);
    expect(threat.id).toBeDefined();
    expect(threat.severity).toBe(5);
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
});
