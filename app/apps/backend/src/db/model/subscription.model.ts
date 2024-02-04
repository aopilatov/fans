import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('subscription')
export class SubscriptionDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    name: 'user_uuid',
    type: 'uuid',
    nullable: false,
  })
  userUuid: string;

  @Column({
    name: 'creator_uuid',
    type: 'uuid',
    nullable: false,
  })
  creatorUuid: string;

  @Column({
    name: 'subscription_level_uuid',
    type: 'uuid',
    nullable: false,
  })
  subscriptionLevelUuid: string;

  @Column({
    name: 'is_notificationed',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isNotificationed: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: Date;
}
