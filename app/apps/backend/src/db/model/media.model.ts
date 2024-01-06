import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { DateTime } from 'luxon';

export enum MEDIA_TYPE {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('media')
export class MediaDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    name: 'media_uuid',
    type: 'uuid',
    nullable: false,
    unique: false,
  })
  mediaUuid: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: MEDIA_TYPE,
    nullable: false,
  })
  type: MEDIA_TYPE;

  @Column({
    name: 'width',
    type: 'int',
    nullable: false,
  })
  width: number;

  @Column({
    name: 'height',
    type: 'int',
    nullable: false,
  })
  height: number;

  @Column({
    name: 'file',
    type: 'text',
    nullable: false,
  })
  file: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: DateTime;
}
