import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1705247575000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TYPE IF EXISTS POST_TYPE;
      CREATE TYPE POST_TYPE AS ENUM ('text', 'image', 'video');

      CREATE TABLE IF NOT EXISTS public."post" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "creator_uuid" UUID NOT NULL,
        "type" POST_TYPE NOT NULL,
        "level" SMALLINT NOT NULL DEFAULT 1,
        "text" TEXT,
        "media_uuids" UUID[],
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_post_creator_uuid ON public."post" USING hash (creator_uuid);
      CREATE INDEX IF NOT EXISTS idx_post_created_at ON public."post" USING brin (created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public."post";');
    await queryRunner.query('DROP TYPE POST_TYPE;');
  }

}
