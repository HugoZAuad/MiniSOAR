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

  public hybridScore!: number;
  public riskScore!: number;
  public containment: boolean;

  constructor(
    public readonly indicator: string,
    public readonly type: string,
    public severity: number = 1,
    public readonly createdAt: Date = new Date(),
    id?: string,
    containment: boolean = false,
  ) {
    this.id = id ?? uuidv4();
    this.containment = containment;

    this.validate();

    this.recalculate(); // <- ordem correta
  }

  static create(props: {
    indicator: string;
    type: string;
    severity?: number;
    createdAt?: Date;
    id?: string;
    containment?: boolean;
    recurrencyCount?: number;
    reputationScore?: number;
    country?: string;
  }): Threat {
    const threat = new Threat(
      props.indicator,
      props.type,
      props.severity ?? 1,
      props.createdAt ?? new Date(),
      props.id,
      props.containment ?? false,
    );

    threat.enrich({
      recurrencyCount: props.recurrencyCount,
      reputationScore: props.reputationScore,
      country: props.country,
    });

    return threat;
  }

  private validate(): void {
    if (this.severity < 1 || this.severity > 10) {
      throw new Error('Severity must be between 1 and 10');
    }
  }

  public enrich(data: ThreatEnrichment): void {
    if (data.country !== undefined) this.country = data.country;
    if (data.reputationScore !== undefined)
      this.reputationScore = data.reputationScore;
    if (data.recurrencyCount !== undefined)
      this.recurrencyCount = data.recurrencyCount;

    this.recalculate();
  }

  public isHighRisk(): boolean {
    return this.hybridScore >= 8;
  }

  private recalculate(): void {
    const reputationWeight = this.reputationScore
      ? (this.reputationScore / 100) * 3
      : 0;

    const recurrencyWeight = Math.min(this.recurrencyCount * 0.5, 2);

    this.hybridScore = Number(
      Math.min(10, this.severity + reputationWeight + recurrencyWeight).toFixed(
        1,
      ),
    );

    this.riskScore = Math.max(
      0,
      Math.min(100, Math.round(this.hybridScore * 10)),
    );
  }
}
