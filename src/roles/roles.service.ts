import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto, tenantId: string): Promise<Role> {
    let permissions: Permission[] = [];
    if (createRoleDto.permissionIds) {
      permissions = await this.permissionRepository.findBy({
        id: In(createRoleDto.permissionIds)
      });
    }

    const role = this.roleRepository.create({
      ...createRoleDto,
      tenantId,
      permissions
    });

    return await this.roleRepository.save(role);
  }

  async findAll(tenantId: string): Promise<Role[]> {
    return this.roleRepository.find({
      where: { tenantId },
      relations: ['permissions']
    });
  }

  async findOne(id: string, tenantId: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, tenantId },
      relations: ['permissions']
    });

    if (!role) {
      throw new NotFoundException(`Role not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, tenantId: string): Promise<Role> {
    const role = await this.findOne(id, tenantId);

    // Update permissions if provided
    if (updateRoleDto.permissionIds) {
      role.permissions = await this.permissionRepository.findBy({
        id: In(updateRoleDto.permissionIds)
      });
    }

    // Only update allowed fields
    const { name, description, permissionIds, ...rest } = updateRoleDto;
    Object.assign(role, { name, description });

    return await this.roleRepository.save(role);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const role = await this.findOne(id, tenantId);
    await this.roleRepository.remove(role);
  }
}
