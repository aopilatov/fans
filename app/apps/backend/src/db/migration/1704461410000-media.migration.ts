import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1704461410000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TYPE IF EXISTS MEDIA_TYPE;
      CREATE TYPE MEDIA_TYPE AS ENUM ('image', 'video');

      DROP TYPE IF EXISTS MEDIA_TRANSFORMATION;
      CREATE TYPE MEDIA_TRANSFORMATION AS ENUM ('none', 'blur');

      CREATE TABLE IF NOT EXISTS public."media" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "media_uuid" UUID NOT NULL,
        "type" MEDIA_TYPE NOT NULL,
        "transformation" MEDIA_TRANSFORMATION NOT NULL,
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
    await queryRunner.query('DROP TYPE MEDIA_TRANSFORMATION;');
  }

}
