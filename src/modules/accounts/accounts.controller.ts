import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Request,
  ParseIntPipe
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';


interface RequestWithUser extends Request {
  user: { id: number; role: string; };
}

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller({ path: 'accounts', version: '1' })
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }


  @Roles('ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Create account for authenticated user' })
  @ApiBody({ type: CreateAccountDto })
  @Post()
  create(@Req() req: RequestWithUser, @Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(req.user.id, createAccountDto);
  }

  @Roles('ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'List accounts (admin sees all, customer sees own)' })
  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.accountsService.findAll(req.user.id, req.user.role);
  }

  @Roles('ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Get account detail by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.accountsService.findOne(id, req.user.id, req.user.role);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update account data (admin only)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateAccountDto })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete account (admin only)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accountsService.remove(id);
  }
}
