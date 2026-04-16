import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) { }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findUserByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.usersRepository.createUser({
      email: createUserDto.email,
      name: createUserDto.name,
      password: hashedPassword,
      role: (createUserDto.role ?? 'CUSTOMER') as Role,
    });
  }

  findAll() {
    return this.usersRepository.findAllUsers();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.usersRepository.findUserById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailOwner = await this.usersRepository.findUserByEmail(
        updateUserDto.email,
      );
      if (emailOwner && emailOwner.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const data: {
      email?: string;
      name?: string;
      role?: Role;
      password?: string;
    } = {};

    if (updateUserDto.email !== undefined) {
      data.email = updateUserDto.email;
    }
    if (updateUserDto.name !== undefined) {
      data.name = updateUserDto.name;
    }
    if (updateUserDto.role !== undefined) {
      data.role = updateUserDto.role as Role;
    }
    if (updateUserDto.password !== undefined) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No data provided to update');
    }

    return this.usersRepository.updateUser(id, data);
  }

  async remove(id: number) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.deleteUser(id);
    return {
      message: 'User deleted successfully',
    };
  }
}
