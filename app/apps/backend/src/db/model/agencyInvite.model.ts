import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('agency_invite')
export class AgencyInviteDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    name: 'agency_uuid',
    type: 'uuid',
    nullable: false,
  })
  agencyUuid: string;

  @Column({
    name: 'creator_uuid',
    type: 'uuid',
    nullable: false,
  })
  creatorUuid: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: Date;
}
