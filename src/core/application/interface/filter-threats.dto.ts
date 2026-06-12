import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FilterThreatsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 15;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  severity?: number;

  @IsOptional()
  @IsString()
  indicator?: string;
}
