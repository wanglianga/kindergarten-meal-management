import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdateIngredientBatchDto {
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsString()
  @IsOptional()
  ingredientName?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  supplierId?: number;

  @IsDateString()
  @IsOptional()
  productionDate?: string;

  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @IsDateString()
  @IsOptional()
  receiveDate?: string;

  @IsString()
  @IsOptional()
  acceptancePhoto?: string;

  @IsString()
  @IsOptional()
  invoicePhoto?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
