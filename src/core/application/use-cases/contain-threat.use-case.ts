import { Inject, Injectable } from "@nestjs/common";

import type { ThreatRepository } from "../../domain/repositories/threat-repository.interface";
import { THREAT_REPOSITORY_TOKEN } from "../../domain/repositories/threat-repository.token";

@Injectable()
export class ContainThreatUseCase {
  constructor(
    @Inject(THREAT_REPOSITORY_TOKEN)
    private readonly repository: ThreatRepository,
  ) {}

  async execute(id: string) {
    await this.repository.updateContainment(id, true);

    return {
      success: true,
      message: "Threat contained",
    };
  }
}