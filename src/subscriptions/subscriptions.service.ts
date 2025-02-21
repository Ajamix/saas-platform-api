import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    // Check if tenant already has an active subscription
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        tenantId: createSubscriptionDto.tenantId,
        status: 'active',
      },
    });

    if (existingSubscription) {
      throw new ConflictException('Tenant already has an active subscription');
    }

    // Verify subscription plan exists
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id: createSubscriptionDto.planId },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const subscription = this.subscriptionRepository.create(createSubscriptionDto);
    return this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      relations: ['tenant', 'plan'],
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['tenant', 'plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findByTenant(tenantId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { tenantId },
      relations: ['plan'],
    });
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findOne(id);
    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionRepository.save(subscription);
  }

  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    
    return this.subscriptionRepository.save(subscription);
  }

  async checkExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: 'active',
        currentPeriodEnd: LessThan(new Date()),
      },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = 'expired';
      await this.subscriptionRepository.save(subscription);
    }
  }

  async getActiveSubscription(tenantId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        tenantId,
        status: 'active',
      },
      relations: ['plan'],
    });
  }
}
