import {
  ConflictException,
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
  ) {}

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

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtServices.sign(payload),
    };
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

    return { access_token: this.jwtServices.sign(payload) };
  }

  async logout() {}

  async refreshTokens() {}

  async getTokens() {}

  async updateRefreshToken() {}
}
