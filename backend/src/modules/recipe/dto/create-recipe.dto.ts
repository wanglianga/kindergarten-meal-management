import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  mealType: string;

  @IsString()
  @IsNotEmpty()
  dishName: string;

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
