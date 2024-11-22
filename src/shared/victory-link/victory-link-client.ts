import * as process from 'node:process';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { handleVictoryLinkErrors } from './handle-victory-link-errors';
import { SMS_LANGUAGES } from './language.enum';

export class VictoryLinkClient {
  private static _instance: VictoryLinkClient;
  private readonly username: string;
  private readonly password: string;
  private readonly sender: string;
  private httpService: HttpService;

  private constructor() {
    this.httpService = new HttpService();
    this.username = process.env.VICTORY_LINK_USERNAME;
    this.password = process.env.VICTORY_LINK_PASSWORD;
    this.sender = process.env.VICTORY_LINK_SENDER;
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new VictoryLinkClient();
    }
    return this._instance;
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    const sms = `Welcome to Ma7ata! Your OTP for registration is ${otp}. Please use this code to complete your registration. This code is valid for ${process.env.OTP_EXPIRATION_MINUTES} minutes. If you didn't request this, please ignore this message. Thank you!`;

    const response = await lastValueFrom(
      this.httpService.post(
        'https://app.community-ads.com/SendSMSAPI/api/SMSSender/SendSMS',
        {
          UserName: this.username,
          Password: this.password,
          SMSText: sms,
          SMSLang: SMS_LANGUAGES.ENGLISH,
          SMSSender: this.sender,
          SMSReceiver: phoneNumber,
          SMSID: uuidv4()
        }
      )
    );

    console.log({
      UserName: this.username,
      Password: this.password,
      SMSText: otp,
      SMSLang: SMS_LANGUAGES.ENGLISH,
      SMSSender: this.sender,
      SMSReceiver: phoneNumber,
      SMSID: uuidv4()
    });
    const responseCode = response.data;

    if (Number(responseCode) !== 0) {
      handleVictoryLinkErrors(Number(responseCode));
    }
  }
}
