import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceDbModel } from '@/db/model';
import { BalanceDbRepository } from '@/db/repository';
import { BalanceService } from './balance.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'balance' }),
    TypeOrmModule.forFeature([BalanceDbModel]),
  ],
  providers: [BalanceDbRepository, BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {}
