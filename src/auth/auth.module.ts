import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpCode } from './entities/otp-code.entity';
import { OtpService } from './services/otp.service';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
    PassportModule,
    TypeOrmModule.forFeature([OtpCode])
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    ApiKeyStrategy
  ]
})
export class AuthModule {}
