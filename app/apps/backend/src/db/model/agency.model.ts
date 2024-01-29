import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('agency')
export class AgencyDbModel {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    name: 'name',
    type: 'text',
    nullable: false,
    unique: false,
  })
  name: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    default: 'NOW()',
  })
  createdAt: Date;
}
