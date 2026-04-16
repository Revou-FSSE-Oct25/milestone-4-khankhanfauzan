import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { ForbiddenException } from '@nestjs/common';

describe('AccountsController', () => {
  let controller: AccountsController;
  let accountsService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    accountsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: accountsService,
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call accountsService.create', async () => {
    const req = { user: { id: 1, role: 'CUSTOMER' } } as any;
    const dto = { accountNumber: '123456789012', balance: 1000 };
    const created = { id: 1, ...dto, userId: 1 };
    accountsService.create.mockResolvedValue(created);

    await expect(controller.create(req, dto)).resolves.toEqual(created);
    expect(accountsService.create).toHaveBeenCalledWith(1, dto);
  });

  it('findAll should call accountsService.findAll', async () => {
    const req = { user: { id: 2, role: 'ADMIN' } } as any;
    const accounts = [{ id: 1 }, { id: 2 }];
    accountsService.findAll.mockResolvedValue(accounts);

    await expect(controller.findAll(req)).resolves.toEqual(accounts);
    expect(accountsService.findAll).toHaveBeenCalledWith(2, 'ADMIN');
  });

  it('findOne should call accountsService.findOne', async () => {
    const req = { user: { id: 3, role: 'CUSTOMER' } } as any;
    const account = { id: 7, userId: 3 };
    accountsService.findOne.mockResolvedValue(account);

    await expect(controller.findOne(req, 7)).resolves.toEqual(account);
    expect(accountsService.findOne).toHaveBeenCalledWith(7, 3, 'CUSTOMER');
  });

  it('update should call accountsService.update', async () => {
    const dto = { balance: 250000 };
    const updated = { id: 1, balance: 250000 };
    accountsService.update.mockResolvedValue(updated);

    await expect(controller.update(1, dto)).resolves.toEqual(updated);
    expect(accountsService.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove should call accountsService.remove', async () => {
    const deleted = { id: 1 };
    accountsService.remove.mockResolvedValue(deleted);

    await expect(controller.remove(1)).resolves.toEqual(deleted);
    expect(accountsService.remove).toHaveBeenCalledWith(1);
  });

  it('findOne should propagate forbidden error for non-owner', async () => {
    accountsService.findOne.mockRejectedValue(
      new ForbiddenException('You are not allowed to access this account'),
    );

    await expect(
      controller.findOne({ user: { id: 9, role: 'CUSTOMER' } } as any, 2),
    ).rejects.toThrow(ForbiddenException);
  });
});
