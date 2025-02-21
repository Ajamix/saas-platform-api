import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(createProfileDto: CreateProfileDto, user: User, request?: Request) {
    const profile = this.profileRepository.create({
      ...createProfileDto,
      userId: user.id,
    });

    const savedProfile = await this.profileRepository.save(profile);

    await this.activityLogsService.logUserActivity(
      user,
      'Created profile',
      'CREATE',
      { profileId: savedProfile.id },
      request,
    );

    return savedProfile;
  }

  async findOne(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto, user: User, request?: Request) {
    const profile = await this.findOne(userId);

    Object.assign(profile, updateProfileDto);
    const updatedProfile = await this.profileRepository.save(profile);

    await this.activityLogsService.logUserActivity(
      user,
      'Updated profile',
      'UPDATE',
      { profileId: profile.id, changes: updateProfileDto },
      request,
    );

    return updatedProfile;
  }

  async updatePreferences(userId: string, preferences: Partial<Profile['preferences']>, user: User, request?: Request) {
    const profile = await this.findOne(userId);

    profile.preferences = {
      ...profile.preferences,
      ...preferences,
    };

    const updatedProfile = await this.profileRepository.save(profile);

    await this.activityLogsService.logUserActivity(
      user,
      'Updated preferences',
      'SETTINGS_CHANGE',
      { profileId: profile.id, changes: preferences },
      request,
    );

    return updatedProfile;
  }

  async updateSocialLinks(userId: string, socialLinks: Partial<Profile['socialLinks']>, user: User, request?: Request) {
    const profile = await this.findOne(userId);

    profile.socialLinks = {
      ...profile.socialLinks,
      ...socialLinks,
    };

    const updatedProfile = await this.profileRepository.save(profile);

    await this.activityLogsService.logUserActivity(
      user,
      'Updated social links',
      'UPDATE',
      { profileId: profile.id, changes: socialLinks },
      request,
    );

    return updatedProfile;
  }
}
