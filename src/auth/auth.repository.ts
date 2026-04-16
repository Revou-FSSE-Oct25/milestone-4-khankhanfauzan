import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Query user berdasarkan email untuk login dan validasi duplikasi saat register.
  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Query user berdasarkan userId
  findUserByUserId(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // Menyimpan user baru ke database melalui Prisma.
  createUser(data: {
    email: string;
    name: string;
    password: string;
    role?: Role;
  }) {
    return this.prisma.user.create({ data });
  }

  // Update hashedRefeshToken berdasarkan userId
  updateUser(userId: number, hash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hash },
    });
  }

  updateUserAll(userId: number) {
    return this.prisma.user.updateMany({
      where: { id: userId, hashedRefreshToken: { not: null } },
      data: {
        hashedRefreshToken: null,
      },
    });
  }
}
