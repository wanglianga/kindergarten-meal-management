import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealDistribution } from '../../entities/meal-distribution.entity';
import { AllergyChild } from '../../entities/allergy-child.entity';
import { Recipe } from '../../entities/recipe.entity';
import { MealDistributionService } from './meal-distribution.service';
import { MealDistributionController } from './meal-distribution.controller';
import { AlertModule } from '../alert/alert.module';

@Module({
  imports: [TypeOrmModule.forFeature([MealDistribution, AllergyChild, Recipe]), AlertModule],
  controllers: [MealDistributionController],
  providers: [MealDistributionService],
  exports: [MealDistributionService],
})
export class MealDistributionModule {}
