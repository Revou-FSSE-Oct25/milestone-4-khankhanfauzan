import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TransferDto {
  @ApiPropertyOptional({
    description: 'Source account ID (use this or fromAccountNumber)',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fromAccountId?: number;

  @ApiPropertyOptional({
    description: 'Source account number (use this or fromAccountId)',
    example: '123456789012',
  })
  @IsOptional()
  @IsString()
  fromAccountNumber?: string;

  @ApiPropertyOptional({
    description: 'Destination account ID (use this or toAccountNumber)',
    example: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  toAccountId?: number;

  @ApiPropertyOptional({
    description: 'Destination account number (use this or toAccountId)',
    example: '987654321098',
  })
  @IsOptional()
  @IsString()
  toAccountNumber?: string;

  @ApiProperty({
    description: 'Transfer amount',
    example: 50000,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;
}
