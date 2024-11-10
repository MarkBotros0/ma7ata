import * as process from 'node:process';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export class VictoryLinkClient {
  private static _instance: VictoryLinkClient;
  private username: string;
  private password: string;
  private sender: string;
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
    const randomGuid = uuidv4();
    const response = await lastValueFrom(
      this.httpService.post(
        'https://app.community-ads.com/SendSMSAPI/api/SMSSender/SendSMS',
        {
          UserName: this.username,
          Password: this.password,
          SMSText: otp,
          SMSLang: 'e',
          SMSSender: this.sender,
          SMSReceiver: phoneNumber,
          SMSID: randomGuid
        }
      )
    );
  }
}
