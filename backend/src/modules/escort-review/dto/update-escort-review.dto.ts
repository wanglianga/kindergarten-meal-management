import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString, Min, Max } from 'class-validator';

export class UpdateEscortReviewDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  parentName?: string;

  @IsOptional()
  @IsString()
  className?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  suggestion?: string;

  @IsOptional()
  @IsBoolean()
  isNegative?: boolean;
}
