import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { UserProfileRepository } from './user-profile.repository';

@Module({
  controllers: [UserProfileController],
  providers: [UserProfileService, UserProfileRepository],
})
export class UserProfileModule {}
