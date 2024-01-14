import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyAdminService } from './agencyAdmin.service';
import { AgencyAdminDbModel } from '@/db/model';
import { AgencyAdminDbRepository } from '@/db/repository';

@Module({
  imports: [TypeOrmModule.forFeature([AgencyAdminDbModel])],
  providers: [AgencyAdminService, AgencyAdminDbRepository],
  exports: [AgencyAdminService],
})
export class AgencyAdminModule {}
