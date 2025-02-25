import { PartialType } from '@nestjs/swagger';
import { CreateReviewSubmissionDto } from './create-review-submission.dto';

export class UpdateReviewSubmissionDto extends PartialType(CreateReviewSubmissionDto) {}
