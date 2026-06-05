import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class RegisterThreatDto {
  @IsString()
  @IsNotEmpty()
  indicator!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  severity!: number;
}