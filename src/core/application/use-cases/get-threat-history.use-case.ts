import {
  Inject,
  Injectable,
} from "@nestjs/common";

import { THREAT_REPOSITORY_TOKEN } from '../../domain/repositories/threat-repository.token';

import type {
  ThreatRepository,
} from "../../domain/repositories/threat-repository.interface";

@Injectable()
export class GetThreatHistoryUseCase {
  constructor(
    @Inject(THREAT_REPOSITORY_TOKEN)
    private readonly repository: ThreatRepository,
  ) {}

  async execute(
    threatId: string,
  ) {
    return this.repository.getHistory(
      threatId,
    );
  }
}