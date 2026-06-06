import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllergyChild } from '../../entities/allergy-child.entity';
import { AllergyChildService } from './allergy-child.service';
import { AllergyChildController } from './allergy-child.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AllergyChild])],
  controllers: [AllergyChildController],
  providers: [AllergyChildService],
  exports: [AllergyChildService],
})
export class AllergyChildModule {}
