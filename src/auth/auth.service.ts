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
      if (userExists.deletedAt) {
        return this.reActivateUser(userExists, createUserDto);
      } else {
        throw new ConflictException(
          'User with this phone Number already exists'
        );
      }
    }

    const hash = await this.hashData(createUserDto.otp);

    const newUser: User = await this.usersService.create(
      createUserDto.phoneNumber
    );

    return this.setUserToken(newUser);
  }

  async setUserToken(user: User) {
    const tokens: AuthTokens = await this.getTokens(
      user.id,
      user.phoneNumber,
      user.userRoles
    );

    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      tokens,
      user
    };
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE_AFTER
    });
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET')
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
  async signIn(phoneNumber: string, otp: number): Promise<any> {
    const user = await this.usersService.findOneByPhoneNumber(phoneNumber);
    // if (user?.otpCode !== otp) {
    //   throw new UnauthorizedException('Entered otp is incorrect');
    // }

    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }

  // TODO implement reactivate user method
  private reActivateUser(user: User, createUserDto: CreateUserDto) {}

  // TODO implement update refresh token
  private async updateRefreshToken(id: number, refreshToken: string) {}

  // TODO implement generate tokens
  private async getTokens(
    id: number,
    phoneNumber: string,
    userRoles: UserRole[]
  ): Promise<any> {}
}
