import { Module } from '@nestjs/common';
import { ConciliationsService } from './conciliations.service';
import { ConciliationsController } from './conciliations.controller';

@Module({
  controllers: [ConciliationsController],
  providers: [ConciliationsService],
})
export class ConciliationsModule {}
