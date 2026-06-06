import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class UpdateClassroomMealDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  className?: string;

  @IsOptional()
  @IsString()
  mealType?: string;

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
