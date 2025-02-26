import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ReviewSubmission } from 'src/review-submissions/entities/review-submission.entity';

@Entity()
export class Review extends BaseEntity{

  @Column({})
  name: string;

  @Column({type: 'enum', enum: ['testimony', 'star']})
  type: 'testimony' | 'star';

  @Column({ nullable: true })
  description?: string;

  @Column()
  tenantId: string;

  @Column({default: false})
  isPublished: boolean;
  @OneToMany(() => ReviewSubmission, (reviewSubmission) => reviewSubmission.review)
  reviewSubmission: ReviewSubmission;

}
