import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DepositDto {
  @ApiPropertyOptional({
    description:
      'Destination account ID for the deposit (use this or toAccountNumber)',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  toAccountId?: number;

  @ApiPropertyOptional({
    description:
      'Destination account number for the deposit (use this or toAccountId)',
    example: '123456789012',
  })
  @IsOptional()
  @IsString()
  toAccountNumber?: string;

  @ApiProperty({
    description: 'Deposit amount',
    example: 250000,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;
}
