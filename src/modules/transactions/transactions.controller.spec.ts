import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { BadRequestException } from '@nestjs/common';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: {
    deposit: jest.Mock;
    withdraw: jest.Mock;
    transfer: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    transactionsService = {
      deposit: jest.fn(),
      withdraw: jest.fn(),
      transfer: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: transactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deposit should call transactionsService.deposit', async () => {
    const req = { user: { id: 1, role: 'CUSTOMER' } };
    const dto = { toAccountId: 1, amount: 200000 };
    const tx = { id: 1, type: 'DEPOSIT', amount: 200000 };
    transactionsService.deposit.mockResolvedValue(tx);

    await expect(controller.deposit(req, dto)).resolves.toEqual(tx);
    expect(transactionsService.deposit).toHaveBeenCalledWith(1, 'CUSTOMER', dto);
  });

  it('withdraw should call transactionsService.withdraw', async () => {
    const req = { user: { id: 1, role: 'CUSTOMER' } };
    const dto = { fromAccountNumber: '123456789012', amount: 50000 };
    const tx = { id: 2, type: 'WITHDRAW', amount: 50000 };
    transactionsService.withdraw.mockResolvedValue(tx);

    await expect(controller.withdraw(req, dto)).resolves.toEqual(tx);
    expect(transactionsService.withdraw).toHaveBeenCalledWith(
      1,
      'CUSTOMER',
      dto,
    );
  });

  it('transfer should call transactionsService.transfer', async () => {
    const req = { user: { id: 2, role: 'CUSTOMER' } };
    const dto = {
      fromAccountId: 1,
      toAccountNumber: '987654321098',
      amount: 100000,
    };
    const tx = { id: 3, type: 'TRANSFER', amount: 100000 };
    transactionsService.transfer.mockResolvedValue(tx);

    await expect(controller.transfer(req, dto)).resolves.toEqual(tx);
    expect(transactionsService.transfer).toHaveBeenCalledWith(2, 'CUSTOMER', dto);
  });

  it('findAll should call transactionsService.findAll', async () => {
    const req = { user: { id: 1, role: 'ADMIN' } };
    const data = [{ id: 1 }, { id: 2 }];
    transactionsService.findAll.mockResolvedValue(data);

    await expect(controller.findAll(req)).resolves.toEqual(data);
    expect(transactionsService.findAll).toHaveBeenCalledWith(1, 'ADMIN');
  });

  it('findOne should call transactionsService.findOne', async () => {
    const req = { user: { id: 1, role: 'CUSTOMER' } };
    const detail = { id: 99 };
    transactionsService.findOne.mockResolvedValue(detail);

    await expect(controller.findOne(req, 99)).resolves.toEqual(detail);
    expect(transactionsService.findOne).toHaveBeenCalledWith(99, 1, 'CUSTOMER');
  });

  it('deposit should propagate bad request error', async () => {
    transactionsService.deposit.mockRejectedValue(
      new BadRequestException(
        'Destination: provide exactly one of accountId or accountNumber',
      ),
    );

    await expect(
      controller.deposit(
        { user: { id: 1, role: 'CUSTOMER' } },
        { toAccountId: 1, toAccountNumber: '123456789012', amount: 1000 },
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
