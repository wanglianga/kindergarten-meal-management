import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAlertDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  message?: string;

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
