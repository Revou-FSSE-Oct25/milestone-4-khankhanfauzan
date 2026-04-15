import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'new.user@revobank.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Display name',
    example: 'New User',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Initial password',
    example: 'StrongPass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'User role',
    example: 'CUSTOMER',
    enum: ['CUSTOMER', 'ADMIN'],
    default: 'CUSTOMER',
  })
  @IsOptional()
  @IsIn(['CUSTOMER', 'ADMIN'])
  role?: 'CUSTOMER' | 'ADMIN';
}
