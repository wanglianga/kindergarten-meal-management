import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomMeal } from '../../entities/classroom-meal.entity';
import { ClassroomMealController } from './classroom-meal.controller';
import { ClassroomMealService } from './classroom-meal.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClassroomMeal])],
  controllers: [ClassroomMealController],
  providers: [ClassroomMealService],
})
export class ClassroomMealModule {}