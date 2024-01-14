import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyInviteService } from './agencyInvite.service';
import { AgencyInviteDbModel } from '@/db/model';
import { AgencyInviteDbRepository } from '@/db/repository';

@Module({
  imports: [TypeOrmModule.forFeature([AgencyInviteDbModel])],
  providers: [AgencyInviteService, AgencyInviteDbRepository],
  exports: [AgencyInviteService],
})
export class AgencyInviteModule {}
