import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('like')
export class LikeDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    name: 'user_uuid',
    type: 'uuid',
    nullable: false,
  })
  userUuid: string;

  @Column({
    name: 'post_uuid',
    type: 'uuid',
    nullable: false,
  })
  postUuid: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: Date;
}
