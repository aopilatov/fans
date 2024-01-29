import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('user')
export class UserDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    name: 'user_tg_id',
    type: 'int8',
    nullable: false,
    unique: false,
  })
  userTgId: number;

  @Column({
    name: 'login',
    type: 'text',
    nullable: false,
    unique: false,
  })
  login: string;

  @Column({
    name: 'tg_token',
    type: 'text',
    nullable: false,
  })
  tgToken: string;

  @Column({
    name: 'is_admin',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isAdmin: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: Date;
}
