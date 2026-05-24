import { Test, TestingModule } from '@nestjs/testing';
import { ConciliationsService } from './conciliations.service';

describe('ConciliationsService', () => {
  let service: ConciliationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConciliationsService],
    }).compile();

    service = module.get<ConciliationsService>(ConciliationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
