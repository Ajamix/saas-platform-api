import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {} 