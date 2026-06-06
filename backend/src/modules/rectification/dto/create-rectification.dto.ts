import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateRectificationDto {
  @IsString()
  @IsIn(['allergy', 'sample_expired', 'batch_expired', 'negative_review'])
  alertType: string;

  @IsOptional()
  @IsNumber()
  relatedId?: number;

  @IsString()
  problemType: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  measures?: string;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'processing', 'completed'])
  status?: string;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  completedDate?: string;

  @IsOptional()
  @IsString()
  handler?: string;

  @IsOptional()
  @IsString()
  resultPhoto?: string;
}
