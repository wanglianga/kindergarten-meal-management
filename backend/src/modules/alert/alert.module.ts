import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from '../../entities/alert.entity';
import { Sample } from '../../entities/sample.entity';
import { IngredientBatch } from '../../entities/ingredient-batch.entity';
import { ClassroomMeal } from '../../entities/classroom-meal.entity';
import { EscortReview } from '../../entities/escort-review.entity';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Sample, IngredientBatch, ClassroomMeal, EscortReview])],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
