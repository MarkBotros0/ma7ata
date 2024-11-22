import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtpEvent1732315421077 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE EVENT delete_expired_otps ON SCHEDULE EVERY 1 MINUTE DO DELETE FROM otp_code oc WHERE oc.expiresAt < NOW() - INTERVAL 5 MINUTE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` DROP EVENT IF EXISTS delete_expired_otps`);
  }
}
