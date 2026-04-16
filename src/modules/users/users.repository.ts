import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
    constructor(private readonly prisma: PrismaService) { }

    private readonly userPublicSelect = {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        accounts: true,
    } satisfies Prisma.UserSelect;

    async findAllUsers() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: this.userPublicSelect,
        });
    }

    findUserById(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
            select: this.userPublicSelect,
        });
    }

    findUserByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
            },
        });
    }

    createUser(data: Prisma.UserCreateInput) {
        return this.prisma.user.create({
            data,
            select: this.userPublicSelect,
        });
    }

    updateUser(id: number, data: Prisma.UserUpdateInput) {
        return this.prisma.user.update({
            where: { id },
            data,
            select: this.userPublicSelect,
        });
    }

    deleteUser(id: number) {
        return this.prisma.user.delete({
            where: { id },
            select: this.userPublicSelect,
        });
    }
}
