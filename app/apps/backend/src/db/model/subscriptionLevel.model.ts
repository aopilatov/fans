import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('subscription_level')
export class SubscriptionLevelDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    name: 'creator_uuid',
    type: 'uuid',
    nullable: false,
  })
  creatorUuid: string;

  @Column({
    name: 'level',
    type: 'int2',
    nullable: false,
  })
  level: number;

  @Column({
    name: 'price',
    type: 'float8',
    nullable: false,
  })
  price: number;

  @Column({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt: Date;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: Date;
}
