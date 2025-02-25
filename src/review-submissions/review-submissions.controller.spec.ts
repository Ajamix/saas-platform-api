import { Test, TestingModule } from '@nestjs/testing';
import { ReviewSubmissionsController } from './review-submissions.controller';
import { ReviewSubmissionsService } from './review-submissions.service';

describe('ReviewSubmissionsController', () => {
  let controller: ReviewSubmissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewSubmissionsController],
      providers: [ReviewSubmissionsService],
    }).compile();

    controller = module.get<ReviewSubmissionsController>(ReviewSubmissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
