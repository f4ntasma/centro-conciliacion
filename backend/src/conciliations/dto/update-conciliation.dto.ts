import { PartialType } from '@nestjs/mapped-types';
import { CreateConciliationDto } from './create-conciliation.dto';

export class UpdateConciliationDto extends PartialType(CreateConciliationDto) {}
