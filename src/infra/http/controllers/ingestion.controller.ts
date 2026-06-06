import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IngestThreatsDto } from '../../../core/application/interface/ingest-threats.dto';
import { IngestThreatsUseCase } from '../../../core/application/use-cases/ingest-threats.use-case';
import { ApiKeyGuard } from '../../guards/api-key.guard';

@Controller('ingestion')
@UseGuards(ApiKeyGuard)
export class IngestionController {
  constructor(private readonly ingestThreatsUseCase: IngestThreatsUseCase) {}

  @Post()
  async ingest(@Body() dto: IngestThreatsDto) {
    return await this.ingestThreatsUseCase.execute(dto.threats);
  }
}
