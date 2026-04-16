import { Injectable } from '@nestjs/common';
import { Prisma, Transaction, TransactionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAccountById(accountId: number) {
    return this.prisma.account.findUnique({
      where: { id: accountId },
    });
  }

  findAccountByAccountNumber(accountNumber: string) {
    return this.prisma.account.findUnique({
      where: { accountNumber },
    });
  }

  findTransactionById(id: number) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        fromAccount: true,
        toAccount: true,
      },
    });
  }

  findAllTransactions() {
    return this.prisma.transaction.findMany({
      include: {
        fromAccount: true,
        toAccount: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findTransactionsByUserId(userId: number) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccount: { userId } },
          { toAccount: { userId } },
        ],
      },
      include: {
        fromAccount: true,
        toAccount: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDeposit(params: { toAccountId: number; amount: number }): Promise<Transaction> {
    return this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: params.toAccountId },
        data: {
          balance: {
            increment: params.amount,
          },
        },
      });

      return tx.transaction.create({
        data: {
          type: TransactionType.DEPOSIT,
          amount: params.amount,
          toAccountId: params.toAccountId,
        },
      });
    });
  }

  async createWithdraw(params: {
    fromAccountId: number;
    amount: number;
  }): Promise<Transaction> {
    return this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: params.fromAccountId },
        data: {
          balance: {
            decrement: params.amount,
          },
        },
      });

      return tx.transaction.create({
        data: {
          type: TransactionType.WITHDRAW,
          amount: params.amount,
          fromAccountId: params.fromAccountId,
        },
      });
    });
  }

  async createTransfer(params: {
    fromAccountId: number;
    toAccountId: number;
    amount: number;
  }): Promise<Transaction> {
    return this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: params.fromAccountId },
        data: {
          balance: {
            decrement: params.amount,
          },
        },
      });

      await tx.account.update({
        where: { id: params.toAccountId },
        data: {
          balance: {
            increment: params.amount,
          },
        },
      });

      return tx.transaction.create({
        data: {
          type: TransactionType.TRANSFER,
          amount: params.amount,
          fromAccountId: params.fromAccountId,
          toAccountId: params.toAccountId,
        },
      });
    });
  }
}
