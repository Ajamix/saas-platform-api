import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityType } from './entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';

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

  async findAll(query: QueryActivityLogDto & { tenantId?: string }) {
    const {
      page = 1,
      limit = 10,
      type,
      startDate,
      endDate,
      search,
      tenantId,
    } = query;

    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.createdAt', 'DESC');

    if (tenantId) {
      queryBuilder.andWhere('log.tenantId = :tenantId', { tenantId });
    }

    if (type) {
      queryBuilder.andWhere('log.type = :type', { type });
    }

    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
    }

    if (search) {
      queryBuilder.andWhere(
        '(log.action ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [logs, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUser(userId: string, query: QueryActivityLogDto) {
    const { page = 1, limit = 10, search } = query;
    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .orderBy('log.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere('log.action ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [logs, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByTenant(tenantId: string, query: QueryActivityLogDto) {
    const { page = 1, limit = 10, search } = query;
    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('log')
      .where('log.tenantId = :tenantId', { tenantId })
      .orderBy('log.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere('log.action ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [logs, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async logUserActivity(
    user: User,
    action: string,
    type: ActivityType,
    details?: Record<string, any>,
    request?: Request,
  ) {
    const activityLog = this.activityLogRepository.create({
      user,
      userId: user.id,
      tenantId: user.tenantId,
      action,
      type,
      details,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return this.activityLogRepository.save(activityLog);
  }
}
