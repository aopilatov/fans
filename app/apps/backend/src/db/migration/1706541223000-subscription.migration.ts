import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1706541223000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public."subscription" (
        "uuid" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_uuid" UUID NOT NULL,
        "creator_uuid" UUID NOT NULL,
        "subscription_level_uuid" UUID NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_subscription_user_uuid ON public."subscription" USING hash (user_uuid);
      CREATE INDEX IF NOT EXISTS idx_subscription_creator_uuid ON public."subscription" USING hash (creator_uuid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public."subscription";');
  }

}
