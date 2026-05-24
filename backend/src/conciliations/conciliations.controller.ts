import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConciliationsService } from './conciliations.service';
import { CreateConciliationDto } from './dto/create-conciliation.dto';
import { UpdateConciliationDto } from './dto/update-conciliation.dto';

@Controller('conciliations')
export class ConciliationsController {
  constructor(private readonly conciliationsService: ConciliationsService) {}

  @Post()
  create(@Body() createConciliationDto: CreateConciliationDto) {
    return this.conciliationsService.create(createConciliationDto);
  }

  @Get()
  findAll() {
    return this.conciliationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conciliationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConciliationDto: UpdateConciliationDto) {
    return this.conciliationsService.update(+id, updateConciliationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conciliationsService.remove(+id);
  }
}
