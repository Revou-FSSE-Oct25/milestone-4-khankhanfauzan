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

  // Menyimpan user baru ke database melalui Prisma.
  createUser(data: {
    email: string;
    name: string;
    password: string;
    role?: Role;
  }) {
    return this.prisma.user.create({ data });
  }
}
