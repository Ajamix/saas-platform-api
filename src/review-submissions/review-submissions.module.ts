import { Module } from '@nestjs/common';
import { ReviewSubmissionsService } from './review-submissions.service';
import { ReviewSubmissionsController } from './review-submissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewSubmission } from './entities/review-submission.entity';
import { GlobalSetting } from 'src/settings/global-settings/entities/global-setting.entity';
import { GlobalSettingsModule } from 'src/settings/global-settings/global-settings.module';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([ReviewSubmission]), GlobalSetting, GlobalSettingsModule, UsersModule],
  controllers: [ReviewSubmissionsController],
  providers: [ReviewSubmissionsService],
})
export class ReviewSubmissionsModule {}
