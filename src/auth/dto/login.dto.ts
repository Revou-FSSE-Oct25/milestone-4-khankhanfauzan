import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Registered email address',
    example: 'customer@revobank.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Account password',
    example: 'StrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
