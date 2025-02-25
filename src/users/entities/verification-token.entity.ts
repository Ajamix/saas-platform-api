import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('verification_tokens')
export class VerificationToken extends BaseEntity {
  @Column()
  token: string;

  @ManyToOne(() => User, (user) => user.verificationTokens, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;
}
