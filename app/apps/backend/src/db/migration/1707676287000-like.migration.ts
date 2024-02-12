import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1707676287000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public."like" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_uuid" UUID NOT NULL,
        "post_uuid" UUID NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_like_user_uuid ON public."like" USING hash (user_uuid);
      CREATE INDEX IF NOT EXISTS idx_like_post_uuid ON public."like" USING hash (post_uuid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public."like";');
  }

}
