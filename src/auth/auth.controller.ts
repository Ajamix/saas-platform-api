import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  LoginSchema,
  LoginResponseSchema,
  RegisterSchema,
  RegisterResponseSchema,
} from '../swagger/schemas/auth.schema';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ schema: LoginSchema })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: LoginResponseSchema,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new tenant and user' })
  @ApiBody({ schema: RegisterSchema })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    schema: RegisterResponseSchema,
  })
  @ApiResponse({ status: 409, description: 'Workspace already taken' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Headers('refresh-token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Request() req) {
    const token = req.query.token;
    return this.authService.verifyEmail(token);
  }

  @Get('resend-verification-email')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Please wait before resending the verification email',
  })
  async resendVerificationEmail(@Request() req) {
    const user = req.user; // Assume user is authenticated and available in the request
    return this.authService.resendVerificationEmail(user);
  }
}
