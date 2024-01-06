import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1704129788000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public."creator" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_uuid" UUID NOT NULL,
        "agency_uuid" UUID NULL,
        "login" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "is_verified" BOOLEAN NOT NULL DEFAULT false,
        "info_short" TEXT NOT NULL,
        "info_long" TEXT,
        "image" JSONB,
        "artwork" JSONB,
        "max_level" SMALLINT NOT NULL DEFAULT 1,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_creator_user_uuid ON public."creator" USING hash (user_uuid);
      CREATE INDEX IF NOT EXISTS idx_creator_agency_uuid ON public."creator" USING hash (agency_uuid);
      CREATE INDEX IF NOT EXISTS idx_creator_login ON public."creator" USING hash (login);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public."creator";');
  }

}
