import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { Profile } from './entities/profile.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  async create(@Body() createProfileDto: CreateProfileDto, @Req() request: RequestWithUser) {
    return this.profilesService.create(createProfileDto, request.user, request);
  }

  @Get('me')
  async findMyProfile(@Req() request: RequestWithUser) {
    return this.profilesService.findOne(request.user.id);
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string, @Req() request: RequestWithUser) {
    // Check if user has permission to view this profile
    if (!request.user.isSuperAdmin && request.user.tenantId !== request.user.tenantId) {
      throw new ForbiddenException('You can only view profiles from your own tenant');
    }
    return this.profilesService.findOne(userId);
  }

  @Patch('me')
  async update(@Body() updateProfileDto: UpdateProfileDto, @Req() request: RequestWithUser) {
    return this.profilesService.update(request.user.id, updateProfileDto, request.user, request);
  }

  @Patch('me/preferences')
  async updatePreferences(
    @Body() preferences: Partial<Profile['preferences']>,
    @Req() request: RequestWithUser,
  ) {
    return this.profilesService.updatePreferences(request.user.id, preferences, request.user, request);
  }

  @Patch('me/social-links')
  async updateSocialLinks(
    @Body() socialLinks: Partial<Profile['socialLinks']>,
    @Req() request: RequestWithUser,
  ) {
    return this.profilesService.updateSocialLinks(request.user.id, socialLinks, request.user, request);
  }
}
