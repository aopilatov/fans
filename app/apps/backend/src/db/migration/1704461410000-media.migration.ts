import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1704461410000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE MEDIA_TYPE AS ENUM ('image', 'video');

      CREATE TABLE IF NOT EXISTS public."media" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "media_uuid" UUID NOT NULL,
        "type" MEDIA_TYPE NOT NULL,
        "width" INT NOT NULL,
        "height" INT NOT NULL,
        "file" TEXT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_media_media_uuid ON public."media" USING hash (media_uuid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public."media";');
    await queryRunner.query('DROP TYPE MEDIA_TYPE;');
  }

}
