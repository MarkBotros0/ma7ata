import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAndOtpEntities1732315398879 implements MigrationInterface {
    name = 'AddUserAndOtpEntities1732315398879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`phone_number\` varchar(15) NOT NULL, \`fullname\` varchar(100) NULL, \`email\` varchar(30) NULL, \`password\` text NULL, \`refreshToken\` varchar(768) NULL, \`user_roles\` set ('Normal', 'Teacher', 'Admin') NOT NULL DEFAULT 'Normal', UNIQUE INDEX \`IDX_17d1817f241f10a3dbafb169fd\` (\`phone_number\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`otp_code\` (\`phone_number\` varchar(15) NOT NULL, \`otp\` text NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`expires_at\` timestamp NOT NULL, PRIMARY KEY (\`phone_number\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`otp_code\``);
        await queryRunner.query(`DROP INDEX \`IDX_17d1817f241f10a3dbafb169fd\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
