import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: ['src/**/entities/**.entity{.ts,.js}'],
  migrations: ['src/db/migrations/*{.ts,.js}'],
  ssl: {
    rejectUnauthorized: false
  }
});
