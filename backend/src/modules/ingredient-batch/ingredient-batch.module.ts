import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientBatch } from '../../entities/ingredient-batch.entity';
import { Supplier } from '../../entities/supplier.entity';
import { IngredientBatchController } from './ingredient-batch.controller';
import { IngredientBatchService } from './ingredient-batch.service';

@Module({
  imports: [TypeOrmModule.forFeature([IngredientBatch, Supplier])],
  controllers: [IngredientBatchController],
  providers: [IngredientBatchService],
  exports: [IngredientBatchService],
})
export class IngredientBatchModule {}
