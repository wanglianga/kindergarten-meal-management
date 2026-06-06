import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateMealDistributionDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  className: string;

  @IsString()
  @IsNotEmpty()
  mealType: string;

  @IsString()
  @IsNotEmpty()
  childName: string;

  @IsArray()
  @IsOptional()
  childAllergens?: string[];

  @IsArray()
  @IsOptional()
  restrictedDishes?: string[];

  @IsString()
  @IsOptional()
  substituteMeal?: string;

  @IsArray()
  @IsOptional()
  substitutePhotos?: string[];

  @IsString()
  @IsOptional()
  confirmedBy?: string;

  @IsBoolean()
  @IsOptional()
  hasRisk?: boolean;

  @IsString()
  @IsOptional()
  riskDescription?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
