import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1707764927000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TYPE IF EXISTS BALANCE_CURRENCY;
      CREATE TYPE BALANCE_CURRENCY AS ENUM ('ton', 'usdt');

      CREATE TABLE IF NOT EXISTS public."balance" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_uuid" UUID NOT NULL,
        "currency" BALANCE_CURRENCY NOT NULL,
        "value" NUMERIC NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_balance ON public."balance" (user_uuid, currency);
      CREATE INDEX IF NOT EXISTS idx_balance_user_uuid ON public."balance" USING hash (user_uuid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public."balance";');
    await queryRunner.query('DROP TYPE IF EXISTS BALANCE_CURRENCY;');
  }

}
