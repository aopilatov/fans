import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { DateTime } from 'luxon';

export enum POST_TYPE {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('post')
export class PostDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    name: 'creator_uuid',
    type: 'uuid',
    nullable: false,
  })
  creatorUuid: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: POST_TYPE,
    nullable: false,
  })
  type: POST_TYPE;

  @Column({
    name: 'level',
    type: 'smallint',
    nullable: false,
    default: 1,
  })
  level: number;

  @Column({
    name: 'text',
    type: 'text',
    nullable: true,
  })
  text: string;

  @Column({
    name: 'media_uuids',
    type: 'uuid',
    array: true,
    nullable: true,
  })
  mediaUuids: string[];

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: DateTime;
}
