import { Column, PrimaryGeneratedColumn, Entity, Index } from 'typeorm';

export enum BALANCE_CURRENCY {
  TON = 'ton',
  USDT = 'usdt',
}

@Entity('balance')
@Index(['userUuid', 'currency'])
export class BalanceDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    name: 'user_uuid',
    type: 'uuid',
    nullable: false,
  })
  userUuid: string;

  @Column({
    name: 'currency',
    type: 'enum',
    enum: BALANCE_CURRENCY,
    nullable: false,
  })
  currency: BALANCE_CURRENCY;

  @Column({
    name: 'value',
    type: 'numeric',
    nullable: false,
    default: 0,
  })
  value: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: Date;
}
