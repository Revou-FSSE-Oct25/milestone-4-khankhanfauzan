import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserProfileDto {
    @ApiPropertyOptional({
        description: 'Display name',
        example: 'Fauzan Khan',
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({
        description: 'Phone number',
        example: '081234567890',
        maxLength: 25,
    })
    @IsOptional()
    @IsString()
    @MaxLength(25)
    phoneNumber?: string;

    @ApiPropertyOptional({
        description: 'Date of birth in ISO-8601 format',
        example: '1998-12-30',
    })
    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;
}
