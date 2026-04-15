import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiPropertyOptional({
    description: 'Transaction type',
    enum: ['DEPOSIT', 'WITHDRAW', 'TRANSFER'],
    example: 'DEPOSIT',
  })
  @IsOptional()
  @IsIn(['DEPOSIT', 'WITHDRAW', 'TRANSFER'])
  type?: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';

  @ApiPropertyOptional({
    description: 'Transaction amount',
    example: 250000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Source account ID (required for withdraw/transfer)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  fromAccountId?: number;

  @ApiPropertyOptional({
    description: 'Destination account ID (required for deposit/transfer)',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  toAccountId?: number;
}
