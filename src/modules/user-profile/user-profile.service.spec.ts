import { Test, TestingModule } from '@nestjs/testing';
import { UserProfileService } from './user-profile.service';
import { UserProfileRepository } from './user-profile.repository';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let userProfileRepository: {
    findUserWithProfileById: jest.Mock;
    updateSelfProfile: jest.Mock;
  };

  beforeEach(async () => {
    userProfileRepository = {
      findUserWithProfileById: jest.fn(),
      updateSelfProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        {
          provide: UserProfileRepository,
          useValue: userProfileRepository,
        },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getOwnProfile should return profile from repository', async () => {
    const profile = { id: 1, email: 'user@mail.com' };
    userProfileRepository.findUserWithProfileById.mockResolvedValue(profile);

    await expect(service.getOwnProfile(1)).resolves.toEqual(profile);
  });

  it('updateOwnProfile should forward data to repository', async () => {
    const updated = { id: 1, name: 'Updated' };
    userProfileRepository.findUserWithProfileById.mockResolvedValue({ id: 1 });
    userProfileRepository.updateSelfProfile.mockResolvedValue(updated);

    await expect(
      service.updateOwnProfile(1, { name: 'Updated' }),
    ).resolves.toEqual(updated);
  });
});
