import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1705236504000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public."agency_invite" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "agency_uuid" UUID NOT NULL,
        "creator_uuid" UUID NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_agency_invite_agency_uuid ON public."agency_invite" USING hash (agency_uuid);
      CREATE INDEX IF NOT EXISTS idx_agency_invite_creator_uuid ON public."agency_invite" USING hash (creator_uuid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public."agency_invite";');
  }

}
