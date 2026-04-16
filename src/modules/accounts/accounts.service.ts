import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountsRepository } from './accounts.repository';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async create(userId: number, createAccountDto: CreateAccountDto) {
    try {
      return await this.accountsRepository.createAccount({
        ...createAccountDto,
        userId, // Inject userId dari token
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Account number already exists');
      }
      throw error;
    }
  }

  async findAll(userId: number, role: string) {
    if (role === 'ADMIN') {
      return this.accountsRepository.findAllAccounts();
    }
    return this.accountsRepository.findAccountsByUserId(userId);
  }

  async findOne(id: number, userId: number, role: string) {
    const account = await this.accountsRepository.findAccountById(id);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    // Pengecekan kepemilikan
    if (account.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not allowed to access this account',
      );
    }

    return account;
  }

  async update(id: number, updateAccountDto: UpdateAccountDto) {
    // Pastikan akun ada
    const account = await this.accountsRepository.findAccountById(id);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    // Aturan Bisnis: Nomor rekening tidak boleh diubah
    if (updateAccountDto.accountNumber) {
      throw new BadRequestException(
        'Account number cannot be modified once created',
      );
    }

    return this.accountsRepository.updateAccount(id, updateAccountDto);
  }

  async remove(id: number) {
    const account = await this.accountsRepository.findAccountById(id);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return this.accountsRepository.deleteAccount(id);
  }
}
