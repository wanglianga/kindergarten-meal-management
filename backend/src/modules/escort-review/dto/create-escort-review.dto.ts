import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsDateString, Min, Max } from 'class-validator';

export class CreateEscortReviewDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  parentName: string;

  @IsOptional()
  @IsString()
  className?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

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
