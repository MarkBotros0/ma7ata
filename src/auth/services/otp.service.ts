import { ConflictException, Injectable } from '@nestjs/common';
import * as otpGenerator from 'otp-generator';
import { OtpCode } from '../entities/otp-code.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { AuthDto } from '../dto/auth.dto';
import * as argon2 from 'argon2';
import { UsersService } from '../../users/users.service';
import { VictoryLinkClient } from '../../shared/victory-link/victory-link-client';
import { Cron } from '@nestjs/schedule';
import * as process from 'node:process';

@Injectable()
export class OtpService {
  private readonly victoryLinkClient: VictoryLinkClient;

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(OtpCode)
    private otpCodeRepository: Repository<OtpCode>
  ) {
    this.victoryLinkClient = VictoryLinkClient.getInstance();
  }

  async generateOtp(phoneNumber: string): Promise<string> {
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + Number(process.env.OTP_EXPIRATION_MINUTES)
    );

    const otp: string = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    const hashedOtp = await argon2.hash(otp);

    const otpCode: Partial<OtpCode> = {
      phoneNumber,
      otp: hashedOtp,
      expiresAt
    };

    await this.otpCodeRepository.delete({
      phoneNumber
    });
    await this.otpCodeRepository.save(otpCode);
    return otp;
  }

  async verifyOtp(authDto: AuthDto): Promise<boolean> {
    const { phoneNumber, otp } = authDto;

    const otpExists = await this.findOtpByPhoneNumber(phoneNumber);

    if (!otpExists) {
      throw new ConflictException('Otp of this phone number is expired');
    }

    return argon2.verify(otpExists.otp, otp);
  }

  async sendOtp(phoneNumber: string) {
    const otp: string = await this.generateOtp(phoneNumber);
    console.log(otp);
    await this.victoryLinkClient.sendOTP(phoneNumber, otp);
  }

  async findOtpByPhoneNumber(phoneNumber: string) {
    return this.otpCodeRepository.findOne({
      where: { phoneNumber }
    });
  }

  @Cron('*/1 * * * *')
  async clearExpiredOtps() {
    const expirationTimeInMinutes = Number(process.env.OTP_EXPIRATION_MINUTES);
    const now = new Date();
    const expirationTime = new Date(
      now.getTime() - expirationTimeInMinutes * 60 * 1000
    );
    await this.otpCodeRepository.delete({
      expiresAt: LessThan(expirationTime)
    });
  }
}
