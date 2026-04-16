import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfileRepository } from './user-profile.repository';

@Injectable()
export class UserProfileService {
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async getOwnProfile(userId: number) {
    const user =
      await this.userProfileRepository.findUserWithProfileById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateOwnProfile(
    userId: number,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    await this.getOwnProfile(userId);
    return this.userProfileRepository.updateSelfProfile(
      userId,
      updateUserProfileDto,
    );
  }
}
