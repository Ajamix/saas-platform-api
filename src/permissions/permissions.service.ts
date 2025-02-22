import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: {
        resource: 'ASC',
        action: 'ASC'
      }
    });
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    return this.permissionRepository.findByIds(ids);
  }
}
