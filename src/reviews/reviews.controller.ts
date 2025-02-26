import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../tenants/guards/tenant.guard';
import { DynamicPermissionsGuard } from '../permissions/guards/dynamic-permissions.guard';
import { ControllerPermissions } from '../permissions/decorators/controller-permissions.decorator';
import { Review } from './entities/review.entity';


@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, TenantGuard, DynamicPermissionsGuard)
@ControllerPermissions('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new review in tenant' })
  @ApiResponse({ status: 201, type: Review })
  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews in tenant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: [Review] })
  findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.reviewsService.findAll(req.user.tenantId, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiResponse({ status: 200, type: Review })
  findOne(@Param('id') id: string, @Request() req) {
    return this.reviewsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review by ID' })
  @ApiResponse({ status: 200, type: Review })
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @Request() req) {
    return this.reviewsService.update(id, updateReviewDto, req.user.tenantId);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a review by ID' })
  @ApiResponse({ status: 200, type: Review })
  publish(@Param('id') id: string, @Request() req) {
    return this.reviewsService.publish(id, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review by ID' })
  @ApiResponse({ status: 200, type: Review })
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.tenantId);
  }
}
