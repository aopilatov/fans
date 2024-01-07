import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1704567570000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public."subscription_level" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "creator_uuid" UUID NOT NULL,
        "level" INT2 NOT NULL,
        "price" FLOAT8 NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_subscription_level_creator_uuid ON public."subscription_level" USING hash (creator_uuid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public."subscription_level";');
  }

}
