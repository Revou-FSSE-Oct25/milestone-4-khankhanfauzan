import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class WithdrawDto {
  @ApiPropertyOptional({
    description: 'Source account ID for the withdrawal (use this or fromAccountNumber)',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fromAccountId?: number;

  @ApiPropertyOptional({
    description:
      'Source account number for the withdrawal (use this or fromAccountId)',
    example: '123456789012',
  })
  @IsOptional()
  @IsString()
  fromAccountNumber?: string;

  @ApiProperty({
    description: 'Withdrawal amount',
    example: 100000,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;
}
