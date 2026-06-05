import { v4 as uuidv4 } from 'uuid';

export class Threat {
  public readonly id: string;

  constructor(
    public readonly indicator: string,
    public readonly type: string,
    public readonly severity: number,
    public readonly createdAt: Date = new Date(),
    id?: string,
  ) {
    this.id = id ?? uuidv4();
    this.validate();
  }

  private validate(): void {
    if (this.severity < 1 || this.severity > 10) {
      throw new Error('Severity must be between 1 and 10');
    }
  }

  public isHighRisk(): boolean {
    return this.severity >= 8;
  }
}
