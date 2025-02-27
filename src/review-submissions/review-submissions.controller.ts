import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ReviewSubmissionsService } from './review-submissions.service';
import { CreateReviewSubmissionDto } from './dto/create-review-submission.dto';
import { UpdateReviewSubmissionDto } from './dto/update-review-submission.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ControllerPermissions } from 'src/permissions/decorators/controller-permissions.decorator';
import { DynamicPermissionsGuard } from 'src/permissions/guards/dynamic-permissions.guard';
import { TenantGuard } from 'src/tenants/guards/tenant.guard';
import { ReviewSubmission } from './entities/review-submission.entity';

@ApiTags('Review-Submissions')
@Controller('review-submissions')
@ControllerPermissions('review-submissions')
export class ReviewSubmissionsController {
  constructor(private readonly reviewSubmissionsService: ReviewSubmissionsService) {}

  @UseGuards(JwtAuthGuard, TenantGuard, DynamicPermissionsGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new review submission' })
  @ApiResponse({ status: 201, type: ReviewSubmission })
  create(@Body() createReviewSubmissionDto: CreateReviewSubmissionDto, @Request() req) {
    return this.reviewSubmissionsService.create(
      createReviewSubmissionDto
    
    );
  }

  @UseGuards(JwtAuthGuard, TenantGuard, DynamicPermissionsGuard)
  @Get()
  @ApiOperation({ summary: 'Get all review submissions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: [ReviewSubmission] })
  findAll(
    @Request() req,
    @Query('reviewId') reviewId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.reviewSubmissionsService.findAll(
      reviewId,
      page,
      limit,
      search,
    );
  }

  @UseGuards(JwtAuthGuard, TenantGuard, DynamicPermissionsGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a review submission by ID' })
  @ApiResponse({ status: 200, type: ReviewSubmission })
  findOne(@Param('id') id: string, @Request() req) {
    return this.reviewSubmissionsService.findOne(id, req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard, DynamicPermissionsGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a review submission by ID' })
  @ApiResponse({ status: 200, type: ReviewSubmission })
  update(
    @Param('id') id: string,
    @Body() updateReviewSubmissionDto: UpdateReviewSubmissionDto,
    @Request() req,
  ) {
    return this.reviewSubmissionsService.update(
      id,
      updateReviewSubmissionDto,
      req.user.tenantId,
    );
  }

  @UseGuards(JwtAuthGuard, TenantGuard, DynamicPermissionsGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review submission by ID' })
  @ApiResponse({ status: 200, type: ReviewSubmission })
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewSubmissionsService.remove(id, req.user.tenantId);
  }

  // ---- NO GUARDS HERE ----
  @Get('published/:reviewId')
  @ApiOperation({ summary: 'Get all published review submissions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: [ReviewSubmission] })
  findAllPublished(
    @Param('reviewId') reviewId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewSubmissionsService.findAllPublished(reviewId, page, limit);
  }

  @Post('create-public/')
  @ApiOperation({ summary: 'Publish a review submission by ID' })
  @ApiResponse({ status: 201, type: ReviewSubmission })
  publish(@Body() createReviewSubmissionDto: CreateReviewSubmissionDto) {
    return this.reviewSubmissionsService.createPublicReviewSubmission(createReviewSubmissionDto);
  }
}
