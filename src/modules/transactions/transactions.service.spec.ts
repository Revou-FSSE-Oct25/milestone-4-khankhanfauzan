import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './transactions.repository';
import { BadRequestException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionsRepository: {
    findAccountById: jest.Mock;
    findAccountByAccountNumber: jest.Mock;
    findTransactionById: jest.Mock;
    findAllTransactions: jest.Mock;
    findTransactionsByUserId: jest.Mock;
    createDeposit: jest.Mock;
    createWithdraw: jest.Mock;
    createTransfer: jest.Mock;
  };

  beforeEach(async () => {
    transactionsRepository = {
      findAccountById: jest.fn(),
      findAccountByAccountNumber: jest.fn(),
      findTransactionById: jest.fn(),
      findAllTransactions: jest.fn(),
      findTransactionsByUserId: jest.fn(),
      createDeposit: jest.fn(),
      createWithdraw: jest.fn(),
      createTransfer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionsRepository,
          useValue: transactionsRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deposit should work with toAccountNumber', async () => {
    transactionsRepository.findAccountByAccountNumber.mockResolvedValue({
      id: 10,
      userId: 2,
    });
    transactionsRepository.createDeposit.mockResolvedValue({
      id: 1,
      type: 'DEPOSIT',
    });

    await expect(
      service.deposit(2, 'CUSTOMER', {
        toAccountNumber: '123456789012',
        amount: 100000,
      }),
    ).resolves.toEqual({ id: 1, type: 'DEPOSIT' });
  });

  it('transfer should reject when source and destination are same', async () => {
    transactionsRepository.findAccountById.mockResolvedValue({
      id: 1,
      userId: 2,
      balance: 500000,
    });

    await expect(
      service.transfer(2, 'CUSTOMER', {
        fromAccountId: 1,
        toAccountId: 1,
        amount: 10000,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
