import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSampleDto {
  @IsString()
  @IsNotEmpty()
  sampleBoxNumber: string;

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
  @IsNotEmpty()
  sampleTime: string;

  @IsString()
  @IsNotEmpty()
  sampler: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  disposeTime?: string;
}
