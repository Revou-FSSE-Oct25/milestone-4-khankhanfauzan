import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { AccountsRepository } from './accounts.repository';
import { NotFoundException } from '@nestjs/common';

describe('AccountsService', () => {
  let service: AccountsService;
  let accountsRepository: {
    createAccount: jest.Mock;
    findAllAccounts: jest.Mock;
    findAccountsByUserId: jest.Mock;
    findAccountById: jest.Mock;
    updateAccount: jest.Mock;
    deleteAccount: jest.Mock;
  };

  beforeEach(async () => {
    accountsRepository = {
      createAccount: jest.fn(),
      findAllAccounts: jest.fn(),
      findAccountsByUserId: jest.fn(),
      findAccountById: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: AccountsRepository, useValue: accountsRepository },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all accounts for admin', async () => {
    const accounts = [{ id: 1 }, { id: 2 }];
    accountsRepository.findAllAccounts.mockResolvedValue(accounts);

    await expect(service.findAll(1, 'ADMIN')).resolves.toEqual(accounts);
  });

  it('findOne should throw not found when account is missing', async () => {
    accountsRepository.findAccountById.mockResolvedValue(null);

    await expect(service.findOne(999, 1, 'ADMIN')).rejects.toThrow(
      NotFoundException,
    );
  });
});
