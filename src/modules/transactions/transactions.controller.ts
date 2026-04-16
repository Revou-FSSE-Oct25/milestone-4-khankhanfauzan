import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';

type RequestWithUser = {
  user: { id: number; role: string };
};

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller({ path: 'transactions', version: '1' })
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Roles('ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Deposit funds into an account' })
  @ApiBody({ type: DepositDto })
  @Post('deposit')
  deposit(@Req() req: RequestWithUser, @Body() dto: DepositDto) {
    return this.transactionsService.deposit(req.user.id, req.user.role, dto);
  }

  @Roles('ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Withdraw funds from an account' })
  @ApiBody({ type: WithdrawDto })
  @Post('withdraw')
  withdraw(@Req() req: RequestWithUser, @Body() dto: WithdrawDto) {
    return this.transactionsService.withdraw(req.user.id, req.user.role, dto);
  }

  @Roles('ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Transfer funds between accounts' })
  @ApiBody({ type: TransferDto })
  @Post('transfer')
  transfer(@Req() req: RequestWithUser, @Body() dto: TransferDto) {
    return this.transactionsService.transfer(req.user.id, req.user.role, dto);
  }

  @Roles('ADMIN', 'CUSTOMER')
  @ApiOperation({
    summary: 'List transactions (admin sees all, customer sees owned accounts)',
  })
  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.transactionsService.findAll(req.user.id, req.user.role);
  }

  @Roles('ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Get transaction detail by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id, req.user.id, req.user.role);
  }
}
