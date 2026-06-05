import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { RegisterThreatInput } from '../../../core/application/interface/register-threat.input';

export class RegisterThreatDto implements RegisterThreatInput {
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
