import { Module } from '@nestjs/common';
import { ThreatModule } from './module/threat/threat.module';

@Module({
  imports: [ThreatModule],
})
export class AppModule {}