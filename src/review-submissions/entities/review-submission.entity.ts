import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Review } from '../../reviews/entities/review.entity';
@Entity()
export class ReviewSubmission extends BaseEntity {
  @ManyToOne(() => Review, (Review) => Review.reviewSubmission)
  review: Review;

  @Column()
  content: string;

  @Column({ nullable: true })
  rating?: number;

  @Column({ default: true })
  isActive: boolean;

}
