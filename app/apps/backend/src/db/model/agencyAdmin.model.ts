import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('agency_admin')
export class AgencyAdminDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    name: 'agency_uuid',
    type: 'uuid',
    nullable: false,
  })
  agencyUuid: string;

  @Column({
    name: 'user_uuid',
    type: 'uuid',
    nullable: false,
  })
  userUuid: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: Date;
}
