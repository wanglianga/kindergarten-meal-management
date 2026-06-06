import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateRecipeDto {
  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  mealType?: string;

  @IsString()
  @IsOptional()
  dishName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  ingredientBatchIds?: number[];

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
