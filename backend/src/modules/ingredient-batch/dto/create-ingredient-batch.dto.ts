import { IsString, IsNumber, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateIngredientBatchDto {
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @IsString()
  @IsNotEmpty()
  ingredientName: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsNotEmpty()
  supplierId: number;

  @IsDateString()
  @IsNotEmpty()
  productionDate: string;

  @IsDateString()
  @IsNotEmpty()
  expirationDate: string;

  @IsDateString()
  @IsNotEmpty()
  receiveDate: string;

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
