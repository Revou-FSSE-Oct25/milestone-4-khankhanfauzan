import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(25)
    phoneNumber?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;
}
