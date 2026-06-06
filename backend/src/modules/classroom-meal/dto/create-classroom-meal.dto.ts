import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateClassroomMealDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  className: string;

  @IsNotEmpty()
  @IsString()
  mealType: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  tempRestrictions?: string;

  @IsOptional()
  @IsString()
  leftovers?: string;

  @IsOptional()
  @IsNumber()
  leftoverCount?: number;

  @IsOptional()
  @IsString()
  recorder?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
