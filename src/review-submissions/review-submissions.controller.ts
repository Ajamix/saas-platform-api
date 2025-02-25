import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReviewSubmissionsService } from './review-submissions.service';
import { CreateReviewSubmissionDto } from './dto/create-review-submission.dto';
import { UpdateReviewSubmissionDto } from './dto/update-review-submission.dto';

@Controller('review-submissions')
export class ReviewSubmissionsController {
  constructor(private readonly reviewSubmissionsService: ReviewSubmissionsService) {}

  @Post()
  create(@Body() createReviewSubmissionDto: CreateReviewSubmissionDto) {
    return this.reviewSubmissionsService.create(createReviewSubmissionDto);
  }

  @Get()
  findAll() {
    return this.reviewSubmissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewSubmissionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewSubmissionDto: UpdateReviewSubmissionDto) {
    return this.reviewSubmissionsService.update(+id, updateReviewSubmissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewSubmissionsService.remove(+id);
  }
}
