import { Test, TestingModule } from '@nestjs/testing';
import { ReviewSubmissionsService } from './review-submissions.service';

describe('ReviewSubmissionsService', () => {
  let service: ReviewSubmissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewSubmissionsService],
    }).compile();

    service = module.get<ReviewSubmissionsService>(ReviewSubmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
