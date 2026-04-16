import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call usersService.create', async () => {
    const dto = {
      email: 'new.user@revobank.com',
      name: 'New User',
      password: 'StrongPass123!',
      role: 'CUSTOMER' as const,
    };
    const created = { id: 1, email: dto.email, name: dto.name, role: dto.role };
    usersService.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(usersService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll should call usersService.findAll', async () => {
    const users = [{ id: 1 }, { id: 2 }];
    usersService.findAll.mockResolvedValue(users);

    await expect(controller.findAll()).resolves.toEqual(users);
    expect(usersService.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne should call usersService.findOne', async () => {
    const user = { id: 1, email: 'user@mail.com' };
    usersService.findOne.mockResolvedValue(user);

    await expect(controller.findOne(1)).resolves.toEqual(user);
    expect(usersService.findOne).toHaveBeenCalledWith(1);
  });

  it('findOne should propagate not found error', async () => {
    usersService.findOne.mockRejectedValue(
      new NotFoundException('User with ID 999 not found'),
    );

    await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('update should call usersService.update', async () => {
    const dto = { name: 'Updated User' };
    const updated = { id: 1, name: 'Updated User' };
    usersService.update.mockResolvedValue(updated);

    await expect(controller.update(1, dto)).resolves.toEqual(updated);
    expect(usersService.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove should call usersService.remove', async () => {
    const result = { message: 'User deleted successfully' };
    usersService.remove.mockResolvedValue(result);

    await expect(controller.remove(1)).resolves.toEqual(result);
    expect(usersService.remove).toHaveBeenCalledWith(1);
  });
});
