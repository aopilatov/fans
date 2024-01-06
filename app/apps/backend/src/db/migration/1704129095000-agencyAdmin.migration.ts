import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1704129095000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public."agency_admin" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "agency_uuid" UUID NOT NULL,
        "user_uuid" UUID NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_agency_admin_agency_uuid ON public."agency_admin" USING hash (agency_uuid);
      CREATE INDEX IF NOT EXISTS idx_agency_admin_user_uuid ON public."agency_admin" USING hash (user_uuid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public."agency_admin";');
  }

}
