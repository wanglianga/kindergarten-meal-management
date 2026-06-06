import { IsString, IsOptional } from 'class-validator';

export class UpdateSampleDto {
  @IsString()
  @IsOptional()
  sampleBoxNumber?: string;

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
  sampleTime?: string;

  @IsString()
  @IsOptional()
  sampler?: string;

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
