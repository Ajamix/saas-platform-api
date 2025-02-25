import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { GlobalSetting } from 'src/settings/global-settings/entities/global-setting.entity';
import { GlobalSettingsModule } from 'src/settings/global-settings/global-settings.module';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([Review]),GlobalSetting,GlobalSettingsModule, UsersModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
