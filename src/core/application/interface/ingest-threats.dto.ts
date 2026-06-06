import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ThreatItemDto {
  @IsString()
  @IsNotEmpty()
  indicator!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsNumber()
  severity!: number;
}

export class IngestThreatsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ThreatItemDto)
  threats!: ThreatItemDto[];
}
