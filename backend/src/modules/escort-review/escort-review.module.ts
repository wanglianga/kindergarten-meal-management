import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscortReview } from '../../entities/escort-review.entity';
import { EscortReviewController } from './escort-review.controller';
import { EscortReviewService } from './escort-review.service';

@Module({
  imports: [TypeOrmModule.forFeature([EscortReview])],
  controllers: [EscortReviewController],
  providers: [EscortReviewService],
})
export class EscortReviewModule {}
