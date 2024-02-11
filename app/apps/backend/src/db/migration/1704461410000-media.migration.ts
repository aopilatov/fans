import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1704461410000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TYPE IF EXISTS MEDIA_TYPE;
      CREATE TYPE MEDIA_TYPE AS ENUM ('image', 'video');

      CREATE TABLE IF NOT EXISTS public."media" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "type" MEDIA_TYPE NOT NULL,
        "width" INT NOT NULL,
        "height" INT NOT NULL,
        "origin" TEXT NOT NULL,
        "none_200" TEXT,
        "blur_200" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public."media";');
    await queryRunner.query('DROP TYPE MEDIA_TYPE;');
  }

}
