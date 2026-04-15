import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AccountsRepository } from './accounts.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccountsController],
  providers: [AccountsService, AccountsRepository],
  exports: [AccountsService]
})
export class AccountsModule { }
