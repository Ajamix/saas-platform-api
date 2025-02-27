import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('subscription_plans')
export class SubscriptionPlan extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'float' })
  price: number;

  @Column()
  interval: string; // monthly, yearly

  @Column({ type: 'jsonb' })
  features: { maxReviewTypes: number; maxSubmissionsPerReviewType: number };

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  stripeLink: string;

  @Column({ type: 'text', nullable: true })
  stripeProductId: string;
}
