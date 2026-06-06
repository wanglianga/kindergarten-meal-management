import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rectification } from '../../entities/rectification.entity';
import { Alert } from '../../entities/alert.entity';
import { RectificationService } from './rectification.service';
import { RectificationController } from './rectification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rectification, Alert])],
  controllers: [RectificationController],
  providers: [RectificationService],
  exports: [RectificationService],
})
export class RectificationModule {}
