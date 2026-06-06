import { PartialType } from '@nestjs/mapped-types';
import { CreateAllergyChildDto } from './create-allergy-child.dto';

export class UpdateAllergyChildDto extends PartialType(CreateAllergyChildDto) {}
