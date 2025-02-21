import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { SuperAdminService } from '../super-admin/super-admin.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { SuperAdmin } from '../users/entities/super-admin.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly superAdminService: SuperAdminService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  private async validateSuperAdmin(email: string, password: string): Promise<SuperAdmin | null> {
    try {
      const superAdmin = await this.superAdminService.findSuperAdminByEmail(email);
      if (superAdmin && await bcrypt.compare(password, superAdmin.password)) {
        const { password, ...result } = superAdmin;
        return result as SuperAdmin;
      }
      return null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  private async validateUser(email: string, tenantId: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmailAndTenant(email, tenantId);
      if (!user || Array.isArray(user)) {
        return null;
      }
      if (await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result as User;
      }
      return null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    // Try SuperAdmin login first
    const superAdmin = await this.validateSuperAdmin(loginDto.email, loginDto.password);
    if (superAdmin) {
      const payload = { 
        email: superAdmin.email, 
        sub: superAdmin.id,
        isSuperAdmin: true 
      };
      
      return {
        user: superAdmin,
        accessToken: this.jwtService.sign(payload, {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_EXPIRATION'),
        }),
        refreshToken: this.jwtService.sign(payload, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
        }),
      };
    }

    // If not SuperAdmin, try tenant user login
    if (!loginDto.subdomain) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let tenant;
    try {
      tenant = await this.tenantsService.findBySubdomain(loginDto.subdomain);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid tenant');
      }
      throw error;
    }

    const user = await this.validateUser(loginDto.email, tenant.id, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      email: user.email, 
      sub: user.id,
      tenantId: tenant.id,
      isSuperAdmin: false 
    };

    return {
      user,
      tenant,
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      }),
    };
  }

  async register(registerDto: RegisterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if tenant subdomain is available
      const existingTenant = await queryRunner.manager.findOne(Tenant, {
        where: { subdomain: registerDto.tenant.subdomain }
      });

      if (existingTenant) {
        throw new ConflictException('Subdomain is already taken');
      }

      // Create tenant
      const tenant = queryRunner.manager.create(Tenant, {
        name: registerDto.tenant.tenantName,
        subdomain: registerDto.tenant.subdomain,
        isActive: true,
      });
      await queryRunner.manager.save(tenant);

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Create user as tenant admin with explicit field mapping
      const user = queryRunner.manager.create(User, {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        isActive: true,
        isSuperAdmin: false,
        tenantId: tenant.id, // Explicitly set the tenantId
        tenant: tenant, // Also set the tenant relation
      });
      
      await queryRunner.manager.save(user);

      // Commit the transaction
      await queryRunner.commitTransaction();

      const payload = { 
        email: user.email, 
        sub: user.id,
        tenantId: tenant.id,
        isSuperAdmin: false 
      };

      return {
        user,
        tenant,
        accessToken: this.jwtService.sign(payload, {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_EXPIRATION'),
        }),
        refreshToken: this.jwtService.sign(payload, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
        }),
      };
    } catch (error) {
      // Rollback the transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const payload = { 
        email: decoded.email, 
        sub: decoded.sub,
        tenantId: decoded.tenantId,
        isSuperAdmin: decoded.isSuperAdmin 
      };

      return {
        accessToken: this.jwtService.sign(payload, {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_EXPIRATION'),
        }),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
