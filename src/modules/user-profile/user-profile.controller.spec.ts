import { Test, TestingModule } from '@nestjs/testing';
import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';

describe('UserProfileController', () => {
  let controller: UserProfileController;
  let userProfileService: {
    getOwnProfile: jest.Mock;
    updateOwnProfile: jest.Mock;
  };

  beforeEach(async () => {
    userProfileService = {
      getOwnProfile: jest.fn(),
      updateOwnProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProfileController],
      providers: [
        {
          provide: UserProfileService,
          useValue: userProfileService,
        },
      ],
    }).compile();

    controller = module.get<UserProfileController>(UserProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getProfile should use req.user.id when available', async () => {
    const profile = { id: 1, email: 'user@mail.com' };
    userProfileService.getOwnProfile.mockResolvedValue(profile);

    await expect(controller.getProfile({ user: { id: 1 } })).resolves.toEqual(
      profile,
    );
    expect(userProfileService.getOwnProfile).toHaveBeenCalledWith(1);
  });

  it('getProfile should fallback to req.user.sub', async () => {
    userProfileService.getOwnProfile.mockResolvedValue({ id: 2 });

    await controller.getProfile({ user: { sub: 2 } });
    expect(userProfileService.getOwnProfile).toHaveBeenCalledWith(2);
  });

  it('updateProfile should call updateOwnProfile', async () => {
    const dto = { name: 'Updated Name', phoneNumber: '081234567890' };
    const updated = { id: 1, name: 'Updated Name' };
    userProfileService.updateOwnProfile.mockResolvedValue(updated);

    await expect(
      controller.updateProfile({ user: { id: 1 } }, dto),
    ).resolves.toEqual(updated);
    expect(userProfileService.updateOwnProfile).toHaveBeenCalledWith(1, dto);
  });
});
