import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateAllergyChildDto {
  @IsString()
  @IsNotEmpty()
  childName: string;

  @IsString()
  @IsNotEmpty()
  className: string;

  @IsArray()
  @IsOptional()
  allergens?: string[];

  @IsString()
  @IsOptional()
  remark?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
