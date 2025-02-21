import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../../users/entities/user.entity';
import { Tenant } from '../../../tenants/entities/tenant.entity';

@Entity('push_subscriptions')
export class PushSubscription extends BaseEntity {
  @Column()
  endpoint: string;

  @Column('jsonb')
  keys: {
    p256dh: string;
    auth: string;
  };

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUsed?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
} 