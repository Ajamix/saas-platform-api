import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalSettingsSeeder } from './global-settings.seeder';
import { GlobalSetting } from '../../settings/global-settings/entities/global-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GlobalSetting])],
  providers: [GlobalSettingsSeeder],
  exports: [GlobalSettingsSeeder],
})
export class DatabaseSeederModule {} 