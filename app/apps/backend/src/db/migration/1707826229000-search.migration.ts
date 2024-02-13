import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1707826229000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION btree_gist;
      CREATE EXTENSION fuzzystrmatch;
      CREATE INDEX IF NOT EXISTS idx_creator_search_login ON public."creator" USING GiST (login);
      CREATE INDEX IF NOT EXISTS idx_creator_search_name ON public."creator" USING GiST (name);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_creator_search_login;');
    await queryRunner.query('DROP INDEX IF EXISTS idx_creator_search_name;');
  }

}
