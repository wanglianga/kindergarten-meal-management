import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from '../../entities/recipe.entity';
import { IngredientBatch } from '../../entities/ingredient-batch.entity';
import { AllergyChild } from '../../entities/allergy-child.entity';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, IngredientBatch, AllergyChild])],
  controllers: [RecipeController],
  providers: [RecipeService],
  exports: [RecipeService],
})
export class RecipeModule {}
