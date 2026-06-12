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
  public containment: boolean;
  public riskScore: number;

  constructor(
    public readonly indicator: string,
    public readonly type: string,
    public severity: number = 1,
    public readonly createdAt: Date = new Date(),
    id?: string,
    containment: boolean = false,
  ) {
    this.containment = containment;

    this.id = id ?? uuidv4();
    this.hybridScore = this.severity;
    this.riskScore = this.calculateRiskScore();
    this.validate();
  }

  static create(props: {
    indicator: string;
    type: string;
    severity?: number;
    createdAt?: Date;
    id?: string;
    recurrencyCount?: number;
    reputationScore?: number;
    country?: string;
  }): Threat {
    const threat = new Threat(
      props.indicator,
      props.type,
      props.severity,
      props.createdAt,
      props.id,
    );

    if (
      props.recurrencyCount !== undefined ||
      props.reputationScore !== undefined ||
      props.country !== undefined
    ) {
      threat.enrich({
        recurrencyCount: props.recurrencyCount,
        reputationScore: props.reputationScore,
        country: props.country,
      });
    }

    return threat;
  }

  private validate(): void {
    if (!this.severity || this.severity < 1 || this.severity > 10) {
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
    this.riskScore = this.calculateRiskScore();
  }

  private calculateRiskScore(): number {
    return Math.max(0, Math.min(100, Math.round(this.hybridScore * 10)));
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
