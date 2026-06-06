import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  type: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  relatedId?: number;

  @IsOptional()
  @IsString()
  alertDate?: string;

  @IsOptional()
  @IsBoolean()
  hasRectification?: boolean;
}
