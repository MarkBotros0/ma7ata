import {
  BadRequestException,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthTokens } from '../types/auth-tokens.type';
import { JwtPayload } from '../types/jwt.payload';
import { AuthDto } from '../dto/auth.dto';
import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  private readonly API_KEY: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService
  ) {
    this.API_KEY = process.env.API_KEY;
  }

  async hashData(data: string): Promise<string> {
    return argon2.hash(data);
  }

  async signUp(authDto: AuthDto): Promise<{ tokens: AuthTokens }> {
    const otpMatches: boolean = await this.otpService.verifyOtp(authDto);
    if (!otpMatches) {
      throw new BadRequestException('OTP provided is not correct');
    }

    const newUser: User = await this.usersService.create(authDto.phoneNumber);

    const tokens: AuthTokens = await this.getTokens(
      newUser.id,
      newUser.phoneNumber
    );
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return { tokens };
  }

  async generateAccessToken(
    userId: number,
    phoneNumber: string
  ): Promise<string> {
    const payload: JwtPayload = { sub: userId, phoneNumber: phoneNumber };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE_AFTER
    });
  }

  async generateRefreshToken(
    userId: number,
    phoneNumber: string
  ): Promise<string> {
    const payload: JwtPayload = { sub: userId, phoneNumber: phoneNumber };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE_AFTER
    });
  }

  async getTokens(userId: number, phoneNumber: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, phoneNumber),
      this.generateRefreshToken(userId, phoneNumber)
    ]);
    return {
      accessToken,
      refreshToken
    };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken
    });
  }

  async signIn(authDto: AuthDto): Promise<{ tokens: AuthTokens }> {
    const isOtpVerified = await this.otpService.verifyOtp(authDto);
    if (!isOtpVerified) throw new BadRequestException('Otp is incorrect');

    const user: User = await this.usersService.findOneByPhoneNumber(
      authDto.phoneNumber
    );

    const tokens: AuthTokens = await this.getTokens(user.id, user.phoneNumber);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return { tokens };
  }

  // TODO implement reactivate user method
  private reActivateUser(user: User, createUserDto: CreateUserDto) {}

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(user.id, user.phoneNumber);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  validateApiKey(apiKey: string): boolean {
    return apiKey == this.API_KEY;
  }
}
