import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async generateTokens(user: Partial<User>): Promise<{ accessToken: string; refreshToken: string }> {
    const accessTokenPayload = {
      sub: user.id as string,
      email: user.email as string,
      role: user.role as string,
    };

    const refreshTokenPayload = {
      sub: user.id as string,
      email: user.email as string,
    };

    // Generate access token using the default JWT service
    const accessToken = this.jwtService.sign(accessTokenPayload);

    // Generate refresh token using explicit options
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') ?? 'your_refresh_secret';
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
    
    // Use type assertion for JWT options - this is a known NestJS typing issue
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    } as Record<string, unknown>);

    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto): Promise<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Create user
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: UserRole.PARTICIPANT,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(user);

      // Store refresh token
      await this.storeRefreshToken(user.id, refreshToken);

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async login(loginDto: LoginDto): Promise<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(userWithoutPassword);

    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async getMe(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'your_refresh_secret',
      });

      const userId = payload.sub;

      // Check if refresh token exists in database and is not revoked
      const storedRefreshToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: userId,
          revoked: false,
          expiresAt: {
            gt: new Date(), // Greater than current time (not expired)
          },
        },
      });

      if (!storedRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);

      // Update refresh token in database
      await this.updateRefreshToken(storedRefreshToken.id, newRefreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<{ message: string }> {
    // Revoke the refresh token
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: userId,
        token: refreshToken,
      },
      data: {
        revoked: true,
      },
    });

    return { message: 'Logged out successfully' };
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: expiresAt,
      },
    });
  }

  private async updateRefreshToken(tokenId: string, newRefreshToken: string): Promise<void> {
    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        token: newRefreshToken,
        expiresAt: expiresAt,
      },
    });
  }
}
