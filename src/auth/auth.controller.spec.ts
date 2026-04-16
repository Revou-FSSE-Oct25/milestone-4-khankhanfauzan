import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    logout: jest.Mock;
    refreshTokens: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      refreshTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register should call authService.register', async () => {
    const dto = {
      email: 'user@mail.com',
      name: 'User',
      password: 'StrongPass123!',
    };
    const tokens = { access_token: 'at', refresh_token: 'rt' };
    authService.register.mockResolvedValue(tokens);

    await expect(controller.register(dto)).resolves.toEqual(tokens);
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('login should call authService.login', async () => {
    const dto = { email: 'user@mail.com', password: 'StrongPass123!' };
    const tokens = { access_token: 'at', refresh_token: 'rt' };
    authService.login.mockResolvedValue(tokens);

    await expect(controller.login(dto)).resolves.toEqual(tokens);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('getProfile should return req.user', () => {
    const req = { user: { id: 1, email: 'user@mail.com', role: 'CUSTOMER' } };
    expect(controller.getProfile(req)).toEqual(req.user);
  });

  it('logout should use req.user.id when available', async () => {
    authService.logout.mockResolvedValue({ message: 'Successfully logged out' });
    await expect(controller.logout({ user: { id: 10 } })).resolves.toEqual({
      message: 'Successfully logged out',
    });
    expect(authService.logout).toHaveBeenCalledWith(10);
  });

  it('logout should fallback to req.user.sub', async () => {
    authService.logout.mockResolvedValue({ message: 'Successfully logged out' });
    await controller.logout({ user: { sub: 11 } });
    expect(authService.logout).toHaveBeenCalledWith(11);
  });

  it('refresh should call authService.refreshTokens with sub and refresh token', async () => {
    const req = { user: { sub: 15, refreshToken: 'refresh-token' } };
    const tokens = { access_token: 'new-at', refresh_token: 'new-rt' };
    authService.refreshTokens.mockResolvedValue(tokens);

    await expect(controller.refresh(req)).resolves.toEqual(tokens);
    expect(authService.refreshTokens).toHaveBeenCalledWith(15, 'refresh-token');
  });

  it('refresh should propagate unauthorized error', async () => {
    authService.refreshTokens.mockRejectedValue(
      new UnauthorizedException('Access Denied'),
    );

    await expect(
      controller.refresh({ user: { sub: 15, refreshToken: 'bad-token' } }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
