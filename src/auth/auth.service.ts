import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
import { VerificationToken } from '../users/entities/verification-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly superAdminService: SuperAdminService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(VerificationToken)
    private readonly verificationTokenRepository: Repository<VerificationToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async validateSuperAdmin(
    email: string,
    password: string,
  ): Promise<SuperAdmin | null> {
    try {
      const superAdmin =
        await this.superAdminService.findSuperAdminByEmail(email);
      if (superAdmin && (await bcrypt.compare(password, superAdmin.password))) {
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

  private async validateUser(
    email: string,
    tenantId: string,
    password: string,
  ): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmailAndTenant(
        email,
        tenantId,
      );
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
    const superAdmin = await this.validateSuperAdmin(
      loginDto.email,
      loginDto.password,
    );
    if (superAdmin) {
      const payload = {
        email: superAdmin.email,
        sub: superAdmin.id,
        isSuperAdmin: true,
        hasSetupProfile: true, // Super admins always have profile setup
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

    const user = await this.validateUser(
      loginDto.email,
      tenant.id,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // if (!user.isVerified) {
    //   const resendResult =
    //     await this.usersService.resendVerificationEmail(user);
    //   throw new ForbiddenException(
    //     `Please verify your email before logging in. ${resendResult.message}`,
    //   );
    // }
    const permissions = user.roles
      .flatMap((role) => role.permissions)
      .reduce(
        (acc, permission) => {
          if (!acc[permission.resource]) {
            acc[permission.resource] = [];
          }
          if (!acc[permission.resource].includes(permission.action)) {
            acc[permission.resource].push(permission.action);
          }
          return acc;
        },
        {} as Record<string, string[]>,
      );
    const payload = {
      email: user.email,
      sub: user.id,
      tenantId: tenant.id,
      hasSetupProfile: user.hasSetupProfile,
      permissions,
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
      const allowUserRegistration =
        await this.tenantsService.getAllowUserRegistration();

      if (!allowUserRegistration) {
        throw new ForbiddenException(
          'User registration is currently disabled.',
        );
      }

      // Check if tenant exists (use regular repository for this check)
      const existingTenant = await this.tenantsService
        .findBySubdomain(registerDto.tenant.subdomain)
        .catch(() => null);

      if (existingTenant) {
        throw new ConflictException('Subdomain already taken');
      }

      // Create tenant using queryRunner
      const tenant = await this.tenantsService.create(
        {
          name: registerDto.tenant.tenantName,
          subdomain: registerDto.tenant.subdomain,
          isActive: true,
        },
        queryRunner,
      );

      // Create user using queryRunner
      const user = await this.usersService.create(
        {
          email: registerDto.email,
          password: registerDto.password,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          isActive: true,
          tenantId: tenant.id,
        },
        queryRunner,
      );

      // Create and assign admin role using queryRunner
      const adminRole = await this.tenantsService.createTenantAdminRole(
        tenant,
        queryRunner,
      );
      await this.tenantsService.assignAdminRole(user, adminRole, queryRunner);

      await queryRunner.commitTransaction();

      const payload = {
        email: user.email,
        sub: user.id,
        tenantId: tenant.id,
        hasSetupProfile: false,
      };

      return {
        user,
        tenant,
        accessToken: this.jwtService.sign(payload),
        refreshToken: this.jwtService.sign(payload, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
        }),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      let payload;
      if (decoded.isSuperAdmin) {
        // Handle super admin refresh
        const superAdmin = await this.superAdminService.findSuperAdminByEmail(
          decoded.email,
        );
        if (!superAdmin) {
          throw new UnauthorizedException('Invalid refresh token');
        }

        payload = {
          email: superAdmin.email,
          sub: superAdmin.id,
          isSuperAdmin: true,
          hasSetupProfile: true, // Super admins always have profile setup
        };
      } else {
        // Handle tenant user refresh
        const tenant = await this.tenantsService.findOne(decoded.tenantId);
        const user = await this.usersService.findByEmailAndTenant(
          decoded.email,
          tenant.id,
        );
        if (!user || Array.isArray(user)) {
          throw new UnauthorizedException('Invalid refresh token');
        }

        const permissions = user.roles
          .flatMap((role) => role.permissions)
          .reduce(
            (acc, permission) => {
              if (!acc[permission.resource]) {
                acc[permission.resource] = [];
              }
              if (!acc[permission.resource].includes(permission.action)) {
                acc[permission.resource].push(permission.action);
              }
              return acc;
            },
            {} as Record<string, string[]>,
          );

        payload = {
          email: user.email,
          sub: user.id,
          tenantId: tenant.id,
          hasSetupProfile: user.hasSetupProfile,
          permissions,
        };
      }

      return {
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
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const verificationToken = await this.verificationTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    const user = verificationToken.user;
    user.isVerified = true;
    await this.userRepository.save(user);

    await this.verificationTokenRepository.remove(verificationToken);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(
    user: User,
  ): Promise<{ message: string; waitTime?: number }> {
    return this.usersService.resendVerificationEmail(user);
  }
}
