import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserWithProfileById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            phoneNumber: true,
            dateOfBirth: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async updateSelfProfile(
    userId: number,
    payload: { name?: string; phoneNumber?: string; dateOfBirth?: string },
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (payload.name !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { name: payload.name },
        });
      }

      if (
        payload.phoneNumber !== undefined ||
        payload.dateOfBirth !== undefined
      ) {
        await tx.userProfile.upsert({
          where: { userId },
          create: {
            userId,
            phoneNumber: payload.phoneNumber,
            dateOfBirth: payload.dateOfBirth
              ? new Date(payload.dateOfBirth)
              : null,
          },
          update: {
            ...(payload.phoneNumber !== undefined
              ? { phoneNumber: payload.phoneNumber }
              : {}),
            ...(payload.dateOfBirth !== undefined
              ? {
                  dateOfBirth: payload.dateOfBirth
                    ? new Date(payload.dateOfBirth)
                    : null,
                }
              : {}),
          },
        });
      }

      return tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              phoneNumber: true,
              dateOfBirth: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    });
  }
}
