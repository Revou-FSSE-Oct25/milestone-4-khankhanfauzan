import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Account, Prisma } from "@prisma/client";

@Injectable()
export class AccountsRepository {
    constructor(private readonly prisma: PrismaService) {
    }

    async createAccount(data: Prisma.AccountUncheckedCreateInput): Promise<Account> {
        return this.prisma.account.create({ data });
    }

    async findAccountsByUserId(userId: number): Promise<Account[]> {
        return this.prisma.account.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findAllAccounts(): Promise<Account[]> {
        return this.prisma.account.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findAccountById(id: number): Promise<Account | null> {
        return this.prisma.account.findUnique({
            where: { id },
            include: {
                sentTransactions: true,
                receivedTransactions: true,
            },
        });
    }

    async updateAccount(id: number, data: Prisma.AccountUpdateInput): Promise<Account> {
        return this.prisma.account.update({
            where: { id },
            data,
        });
    }

    async deleteAccount(id: number): Promise<Account> {
        return this.prisma.account.delete({
            where: { id },
        });
    }
}
