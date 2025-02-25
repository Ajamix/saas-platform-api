import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperAdmin } from '../../users/entities/super-admin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminSeeder {
  private readonly logger = new Logger(SuperAdminSeeder.name);

  constructor(
    @InjectRepository(SuperAdmin)
    private readonly superAdminRepository: Repository<SuperAdmin>,
  ) {}

  async seed() {
    try {
      const existingSuperAdmin = await this.superAdminRepository.findOne({
        where: { email: 'superadmin@example.com' },
      });

      if (!existingSuperAdmin) {
        const hashedPassword = await bcrypt.hash('aliali12', 10);

        const superAdmin = this.superAdminRepository.create({
          email: 'superadmin@example.com',
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          isActive: true,
          permissions: ['*'], // All permissions
        });

        await this.superAdminRepository.save(superAdmin);
        this.logger.log('Default super admin created successfully');
      } else {
        this.logger.log('Super admin already exists, skipping seeding');
      }
    } catch (error) {
      this.logger.error('Error seeding super admin:', error.message);
      throw error;
    }
  }
}
