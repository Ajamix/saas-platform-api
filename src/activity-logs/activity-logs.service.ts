import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(createActivityLogDto: CreateActivityLogDto, request?: Request) {
    const activityLog = this.activityLogRepository.create({
      ...createActivityLogDto,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return this.activityLogRepository.save(activityLog);
  }

  async findAll(tenantId?: string) {
    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('activityLog')
      .leftJoinAndSelect('activityLog.user', 'user')
      .leftJoinAndSelect('activityLog.tenant', 'tenant')
      .orderBy('activityLog.createdAt', 'DESC');

    if (tenantId) {
      queryBuilder.where('activityLog.tenantId = :tenantId', { tenantId });
    }

    return queryBuilder.getMany();
  }

  async findByUser(userId: string) {
    return this.activityLogRepository.find({
      where: { userId },
      relations: ['user', 'tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenant(tenantId: string) {
    return this.activityLogRepository.find({
      where: { tenantId },
      relations: ['user', 'tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async logUserActivity(
    user: User,
    action: string,
    type: string,
    details?: Record<string, any>,
    request?: Request,
  ) {
    const activityLog = this.activityLogRepository.create({
      user,
      userId: user.id,
      tenantId: user.tenantId,
      action,
      type: type as any,
      details,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return this.activityLogRepository.save(activityLog);
  }
}
