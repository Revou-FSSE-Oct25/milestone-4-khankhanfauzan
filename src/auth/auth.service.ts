import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtServices: JwtService,
    private config: ConfigService,
    private readonly authRepository: AuthRepository,
  ) { }

  // Register user baru: cek email unik, hash password, simpan user, lalu kembalikan access token.
  async register(registerDto: RegisterDto) {
    const existingUser = await this.authRepository.findUserByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.authRepository.createUser({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
    });


    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;

  }

  // Login user: validasi kredensial dan hasilkan access token berbasis role.
  async login(loginDto: LoginDto) {
    const user = await this.authRepository.findUserByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };


    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: number) {
    await this.authRepository.updateUserAll(userId);

    return {
      message: 'Successfully logged out'
    }
  }

  async refreshTokens(userId: number, rt: string) {
    const user = await this.authRepository.findUserByUserId(userId);

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const rtMatches = await bcrypt.compare(rt, user.hashedRefreshToken);

    if (!rtMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async getTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [at, rt] = await Promise.all([
      this.jwtServices.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'), expiresIn: '15m'
      }),
      this.jwtServices.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'refresh-secret'),
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    }
  }

  async updateRefreshToken(userId: number, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    return this.authRepository.updateUser(userId, hash);
  }
}
