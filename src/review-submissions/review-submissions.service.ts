import { Injectable } from '@nestjs/common';
import { CreateReviewSubmissionDto } from './dto/create-review-submission.dto';
import { UpdateReviewSubmissionDto } from './dto/update-review-submission.dto';

@Injectable()
export class ReviewSubmissionsService {
  create(createReviewSubmissionDto: CreateReviewSubmissionDto) {
    return 'This action adds a new reviewSubmission';
  }

  findAll() {
    return `This action returns all reviewSubmissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reviewSubmission`;
  }

  update(id: number, updateReviewSubmissionDto: UpdateReviewSubmissionDto) {
    return `This action updates a #${id} reviewSubmission`;
  }

  remove(id: number) {
    return `This action removes a #${id} reviewSubmission`;
  }
}
