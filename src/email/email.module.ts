import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SettingsModule } from '../settings/settings.module';
import { EmailTemplatesService } from './templates/email-templates.service';

@Module({
  imports: [SettingsModule],
  providers: [EmailService, EmailTemplatesService],
  exports: [EmailService],
})
export class EmailModule {} 