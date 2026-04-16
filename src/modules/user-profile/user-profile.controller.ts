import { Body, Controller, Get, Patch, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';

type AuthenticatedRequest = {
  user: {
    id?: number;
    sub?: number;
  };
};

@ApiTags('User Profile')
@ApiBearerAuth()
@Controller({ path: 'user', version: '1' })
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Roles('ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Get own profile' })
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    const userId = Number(req.user.id ?? req.user.sub);
    return this.userProfileService.getOwnProfile(userId);
  }

  @Roles('ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Update own profile' })
  @ApiBody({ type: UpdateUserProfileDto })
  @Patch('profile')
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const userId = Number(req.user.id ?? req.user.sub);
    return this.userProfileService.updateOwnProfile(
      userId,
      updateUserProfileDto,
    );
  }
}
