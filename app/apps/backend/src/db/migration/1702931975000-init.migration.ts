import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1702931975000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS public."user" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_tg_id" INT8 NOT NULL,
        "tg_token" TEXT NOT NULL,
        "login" TEXT NOT NULL,
        "is_admin" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_user_user_tg_id ON public."user" USING hash (user_tg_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public."user";');
  }

}
