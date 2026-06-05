import { v4 as uuidv4 } from 'uuid';

export interface ThreatEnrichment {
  country?: string;
  reputationScore?: number;
  recurrencyCount?: number;
}

export class Threat {
  public readonly id: string;
  public country?: string;
  public reputationScore?: number;
  public recurrencyCount: number = 0;
  public hybridScore: number;

  constructor(
    public readonly indicator: string,
    public readonly type: string,
    public readonly severity: number,
    public readonly createdAt: Date = new Date(),
    id?: string,
  ) {
    this.id = id ?? uuidv4();
    this.hybridScore = severity;
    this.validate();
  }

  private validate(): void {
    if (this.severity < 1 || this.severity > 10) {
      throw new Error('Severity must be between 1 and 10');
    }
  }

  public isHighRisk(): boolean {
    return this.hybridScore >= 8;
  }

  public enrich(data: ThreatEnrichment): void {
    this.country = data.country ?? this.country;
    this.reputationScore = data.reputationScore ?? this.reputationScore;
    this.recurrencyCount = data.recurrencyCount ?? this.recurrencyCount;

    this.calculateHybridScore();
  }

  private calculateHybridScore(): void {
    const reputationWeight = this.reputationScore
      ? (this.reputationScore / 100) * 3
      : 0;
    const recurrencyWeight = Math.min(this.recurrencyCount * 0.5, 2);

    const totalScore = this.severity + reputationWeight + recurrencyWeight;

    this.hybridScore = Number(Math.min(10, totalScore).toFixed(1));
  }
}
