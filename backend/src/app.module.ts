import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import * as fs from 'fs';
import * as initSqlJs from 'sql.js';
import { AuthModule } from './modules/auth/auth.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { IngredientBatchModule } from './modules/ingredient-batch/ingredient-batch.module';
import { RecipeModule } from './modules/recipe/recipe.module';
import { SampleModule } from './modules/sample/sample.module';
import { ClassroomMealModule } from './modules/classroom-meal/classroom-meal.module';
import { EscortReviewModule } from './modules/escort-review/escort-review.module';
import { RectificationModule } from './modules/rectification/rectification.module';
import { AlertModule } from './modules/alert/alert.module';
import { User } from './entities/user.entity';
import { Supplier } from './entities/supplier.entity';
import { IngredientBatch } from './entities/ingredient-batch.entity';
import { Recipe } from './entities/recipe.entity';
import { Sample } from './entities/sample.entity';
import { ClassroomMeal } from './entities/classroom-meal.entity';
import { EscortReview } from './entities/escort-review.entity';
import { Rectification } from './entities/rectification.entity';
import { Alert } from './entities/alert.entity';

const dataDir = join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const SQL = await initSqlJs();
        return {
          type: 'sqljs',
          driver: SQL,
          location: join(dataDir, 'meal.db'),
          autoSave: true,
          entities: [
            User,
            Supplier,
            IngredientBatch,
            Recipe,
            Sample,
            ClassroomMeal,
            EscortReview,
            Rectification,
            Alert,
          ],
          synchronize: true,
          logging: false,
        };
      },
    }),
    AuthModule,
    SupplierModule,
    IngredientBatchModule,
    RecipeModule,
    SampleModule,
    ClassroomMealModule,
    EscortReviewModule,
    RectificationModule,
    AlertModule,
  ],
})
export class AppModule {}
