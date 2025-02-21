import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum ActivityType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  SUBSCRIPTION_CHANGE = 'subscription_change',
  ROLE_CHANGE = 'role_change',
  PERMISSION_CHANGE = 'permission_change',
  SETTINGS_CHANGE = 'settings_change',
  NOTIFICATION_SENT = 'notification_sent',
  OTHER = 'other'
}

@Entity('activity_logs')
export class ActivityLog extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.OTHER
  })
  type: ActivityType;

  @Column()
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resourceType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resourceId: string;

  @Column({ default: false })
  isSystemGenerated: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string;
}
