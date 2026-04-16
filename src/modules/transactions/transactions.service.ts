import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  private async resolveAccount(input: {
    accountId?: number;
    accountNumber?: string;
    label: string;
  }) {
    const hasId = input.accountId !== undefined;
    const hasAccountNumber = !!input.accountNumber;

    if (hasId === hasAccountNumber) {
      throw new BadRequestException(
        `${input.label}: provide exactly one of accountId or accountNumber`,
      );
    }

    const account = hasId
      ? await this.transactionsRepository.findAccountById(
          Number(input.accountId),
        )
      : await this.transactionsRepository.findAccountByAccountNumber(
          String(input.accountNumber),
        );

    if (!account) {
      const identifier = hasId
        ? `ID ${input.accountId}`
        : `account number ${input.accountNumber}`;
      throw new NotFoundException(
        `${input.label} account with ${identifier} not found`,
      );
    }

    return account;
  }

  private assertOwnership(
    accountUserId: number,
    requesterUserId: number,
    requesterRole: string,
  ) {
    if (requesterRole !== 'ADMIN' && accountUserId !== requesterUserId) {
      throw new ForbiddenException(
        'You are not allowed to access this account',
      );
    }
  }

  private toNumber(amount: { toString(): string } | number): number {
    if (typeof amount === 'number') {
      return amount;
    }
    return Number(amount.toString());
  }

  async deposit(userId: number, role: string, dto: DepositDto) {
    const toAccount = await this.resolveAccount({
      accountId: dto.toAccountId,
      accountNumber: dto.toAccountNumber,
      label: 'Destination',
    });

    this.assertOwnership(toAccount.userId, userId, role);
    return this.transactionsRepository.createDeposit({
      toAccountId: toAccount.id,
      amount: dto.amount,
    });
  }

  async withdraw(userId: number, role: string, dto: WithdrawDto) {
    const fromAccount = await this.resolveAccount({
      accountId: dto.fromAccountId,
      accountNumber: dto.fromAccountNumber,
      label: 'Source',
    });

    this.assertOwnership(fromAccount.userId, userId, role);

    const currentBalance = this.toNumber(fromAccount.balance);
    if (currentBalance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.transactionsRepository.createWithdraw({
      fromAccountId: fromAccount.id,
      amount: dto.amount,
    });
  }

  async transfer(userId: number, role: string, dto: TransferDto) {
    const [fromAccount, toAccount] = await Promise.all([
      this.resolveAccount({
        accountId: dto.fromAccountId,
        accountNumber: dto.fromAccountNumber,
        label: 'Source',
      }),
      this.resolveAccount({
        accountId: dto.toAccountId,
        accountNumber: dto.toAccountNumber,
        label: 'Destination',
      }),
    ]);

    if (fromAccount.id === toAccount.id) {
      throw new BadRequestException(
        'Source and destination account must be different',
      );
    }

    this.assertOwnership(fromAccount.userId, userId, role);

    const currentBalance = this.toNumber(fromAccount.balance);
    if (currentBalance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.transactionsRepository.createTransfer({
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      amount: dto.amount,
    });
  }

  findAll(userId: number, role: string) {
    if (role === 'ADMIN') {
      return this.transactionsRepository.findAllTransactions();
    }

    return this.transactionsRepository.findTransactionsByUserId(userId);
  }

  async findOne(id: number, userId: number, role: string) {
    const transaction =
      await this.transactionsRepository.findTransactionById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (role !== 'ADMIN') {
      const fromUserId = transaction.fromAccount?.userId;
      const toUserId = transaction.toAccount?.userId;
      if (fromUserId !== userId && toUserId !== userId) {
        throw new ForbiddenException(
          'You are not allowed to access this transaction',
        );
      }
    }

    return transaction;
  }
}
