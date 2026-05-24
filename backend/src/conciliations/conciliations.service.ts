import { Injectable } from '@nestjs/common';
import { CreateConciliationDto } from './dto/create-conciliation.dto';
import { UpdateConciliationDto } from './dto/update-conciliation.dto';

@Injectable()
export class ConciliationsService {
  create(createConciliationDto: CreateConciliationDto) {
    return 'This action adds a new conciliation';
  }

  findAll() {
    return `This action returns all conciliations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} conciliation`;
  }

  update(id: number, updateConciliationDto: UpdateConciliationDto) {
    return `This action updates a #${id} conciliation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conciliation`;
  }
}
