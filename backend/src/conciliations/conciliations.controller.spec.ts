import { Test, TestingModule } from '@nestjs/testing';
import { ConciliationsController } from './conciliations.controller';
import { ConciliationsService } from './conciliations.service';

describe('ConciliationsController', () => {
  let controller: ConciliationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConciliationsController],
      providers: [ConciliationsService],
    }).compile();

    controller = module.get<ConciliationsController>(ConciliationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
