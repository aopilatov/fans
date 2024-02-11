import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

export enum MEDIA_TYPE {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('media')
export class MediaDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

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
    name: 'origin',
    type: 'text',
    nullable: false,
  })
  origin: string;

  @Column({
    name: 'none_200',
    type: 'text',
    nullable: true,
  })
  none200: string;

  @Column({
    name: 'blur_200',
    type: 'text',
    nullable: true,
  })
  blur200: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: Date;
}
