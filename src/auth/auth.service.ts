import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt.payload';
import * as process from 'node:process';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../users/enums/user-roles.enum';
import { AuthTokens } from './types/auth-tokens.type';
import { VerifyOTPDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService
  ) {}

  async hashData(data: string) {
    return argon2.hash(data);
  }

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    const userExists: User = await this.usersService.findOneByPhoneNumber(
      createUserDto.phoneNumber
    );

    if (userExists) {
        throw new ConflictException(
          'User with this phone Number already exists'
        );
      }

    const hash = await this.hashData(createUserDto.otp);

    const newUser: User = await this.usersService.create(
      createUserDto.phoneNumber
    );

    const tokens = await this.getTokens(newUser.id, newUser.phoneNumber);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async generateAccessToken(userId:number,phoneNumber:string): Promise<string> {
    const payload = { sub: userId, phoneNumber: phoneNumber };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE_AFTER
    });
  }

  async generateRefreshToken(userId:number,phoneNumber:string): Promise<string> {
    const payload = { sub: userId, phoneNumber: phoneNumber };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE_AFTER
    });
  }

  async generateOTPToken(phoneNumber: string) {
    const payload = { phoneNumber };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_OTP_SECRET'),
      expiresIn: process.env.OTP_TOKEN_EXPIRE_AFTER
    });
  }

  // TODO implement sign in logic
	async signIn(data: VerifyOTPDto) {
    // Check if user exists
    const user = await this.usersService.findOneByPhoneNumber(data.phoneNumber);
    if (!user) throw new BadRequestException('User does not exist');
    const passwordMatches = await argon2.verify(user.password, data.otpCode);
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');
    const tokens = await this.getTokens(user.id, user.phoneNumber);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // TODO implement reactivate user method
  private reActivateUser(user: User, createUserDto: CreateUserDto) {}


  async getTokens(userId: number, phoneNumber: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId,phoneNumber),
      this.generateRefreshToken(userId,phoneNumber)
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
