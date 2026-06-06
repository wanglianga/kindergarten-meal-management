import { PartialType } from '@nestjs/mapped-types';
import { CreateMealDistributionDto } from './create-meal-distribution.dto';

export class UpdateMealDistributionDto extends PartialType(CreateMealDistributionDto) {}
