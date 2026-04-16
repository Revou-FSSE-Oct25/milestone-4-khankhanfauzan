import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: {
    findUserByEmail: jest.Mock;
    createUser: jest.Mock;
    findAllUsers: jest.Mock;
    findUserById: jest.Mock;
    updateUser: jest.Mock;
    deleteUser: jest.Mock;
  };

  beforeEach(async () => {
    usersRepository = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      findAllUsers: jest.fn(),
      findUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: usersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return repository data', async () => {
    const users = [{ id: 1 }, { id: 2 }];
    usersRepository.findAllUsers.mockResolvedValue(users);

    await expect(service.findAll()).resolves.toEqual(users);
  });

  it('create should throw conflict when email already exists', async () => {
    usersRepository.findUserByEmail.mockResolvedValue({ id: 1 });

    await expect(
      service.create({
        email: 'existing@mail.com',
        name: 'Existing',
        password: 'StrongPass123!',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('findOne should throw not found when user does not exist', async () => {
    usersRepository.findUserById.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
