import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    Min,
} from 'class-validator';

export class CreateAccountDto {
    @ApiProperty({
        description: 'Unique bank account number',
        example: '1234567890',
    })
    @IsString({ message: 'Account number must be a string' })
    @IsNotEmpty({ message: 'Account number is required' })
    @Length(10, 15, {
        message: 'Account number length must be between 10 and 15 characters',
    })
    accountNumber: string;

    @ApiPropertyOptional({
        description: 'Initial account balance (optional)',
        example: 500000,
        default: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Balance must be a number' })
    @Min(0, { message: 'Balance cannot be negative' })
    balance?: number;
}
