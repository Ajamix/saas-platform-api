import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { NotificationType } from '../notifications.service';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({
    type: 'enum',
    enum: [
      'user_registration',
      'password_reset',
      'subscription_change',
      'payment_reminder',
      'system_update',
      'role_change',
      'team_update',
    ],
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

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
  readAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ default: false })
  isActionRequired: boolean;

  @Column({ nullable: true })
  actionUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
} 