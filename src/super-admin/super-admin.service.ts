import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SuperAdmin } from '../users/entities/super-admin.entity';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { SubscriptionPlan } from '../subscriptions/entities/subscription-plan.entity';
import { CreateSubscriptionPlanDto } from '../subscriptions/dto/create-subscription-plan.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(SuperAdmin)
    private readonly superAdminRepository: Repository<SuperAdmin>,
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) {}

  async createSuperAdmin(createSuperAdminDto: CreateSuperAdminDto): Promise<SuperAdmin> {
    const existingSuperAdmin = await this.superAdminRepository.findOne({
      where: { email: createSuperAdminDto.email },
    });

    if (existingSuperAdmin) {
      throw new ConflictException('Super admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createSuperAdminDto.password, 10);

    const superAdmin = this.superAdminRepository.create({
      ...createSuperAdminDto,
      password: hashedPassword,
    });

    return this.superAdminRepository.save(superAdmin);
  }
  async findSuperAdminByEmail(email: string): Promise<SuperAdmin | null> {
    const superAdmin = await this.superAdminRepository.findOne({ where: { email } });

    return superAdmin;
  }

  // Subscription Plan Management
  async createSubscriptionPlan(createSubscriptionPlanDto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = this.subscriptionPlanRepository.create(createSubscriptionPlanDto);
    return this.subscriptionPlanRepository.save(plan);
  }

  async updateSubscriptionPlan(id: string, updateData: Partial<CreateSubscriptionPlanDto>): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    Object.assign(plan, updateData);
    return this.subscriptionPlanRepository.save(plan);
  }

  async deleteSubscriptionPlan(id: string): Promise<void> {
    const result = await this.subscriptionPlanRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Subscription plan not found');
    }
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionPlanRepository.find();
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }
} 