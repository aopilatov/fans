import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { DateTime } from 'luxon';

@Entity('creator')
export class CreatorDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    name: 'user_uuid',
    type: 'uuid',
    nullable: false,
  })
  userUuid: string;

  @Column({
    name: 'agency_uuid',
    type: 'uuid',
    nullable: true,
  })
  agencyUuid: string;

  @Column({
    name: 'login',
    type: 'text',
    nullable: false,
  })
  login: string;

  @Column({
    name: 'name',
    type: 'text',
    nullable: false,
  })
  name: string;

  @Column({
    name: 'is_verified',
    type: 'boolean',
    nullable: false,
    default: 'false',
  })
  isVerified: string;

  @Column({
    name: 'info_short',
    type: 'text',
    nullable: false,
  })
  infoShort: string;

  @Column({
    name: 'info_long',
    type: 'text',
    nullable: true,
  })
  infoLong: string;

  @Column({
    name: 'image',
    type: 'jsonb',
    nullable: true,
  })
  image: Record<string, any>[];

  @Column({
    name: 'artwork',
    type: 'jsonb',
    nullable: true,
  })
  artwork: Record<string, any>[];

  @Column({
    name: 'max_level',
    type: 'smallint',
    nullable: false,
    default: 1,
  })
  maxLevel: number;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: DateTime;
}
