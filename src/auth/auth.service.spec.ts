import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: {
    findUserByEmail: jest.Mock;
    createUser: jest.Mock;
    updateUser: jest.Mock;
    updateUserAll: jest.Mock;
    findUserByUserId: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };

  beforeEach(async () => {
    authRepository = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      updateUserAll: jest.fn(),
      findUserByUserId: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };
    configService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: authRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('register should throw conflict when email already exists', async () => {
    authRepository.findUserByEmail.mockResolvedValue({ id: 1 });

    await expect(
      service.register({
        email: 'existing@mail.com',
        name: 'Existing User',
        password: 'StrongPass123!',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('login should throw unauthorized when email not found', async () => {
    authRepository.findUserByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'unknown@mail.com',
        password: 'StrongPass123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
