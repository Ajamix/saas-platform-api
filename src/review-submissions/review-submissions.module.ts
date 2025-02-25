import { Module } from '@nestjs/common';
import { ReviewSubmissionsService } from './review-submissions.service';
import { ReviewSubmissionsController } from './review-submissions.controller';

@Module({
  controllers: [ReviewSubmissionsController],
  providers: [ReviewSubmissionsService],
})
export class ReviewSubmissionsModule {}
