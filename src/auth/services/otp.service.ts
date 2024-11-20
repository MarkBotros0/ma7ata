import { Injectable } from '@nestjs/common';
import * as otpGenerator from 'otp-generator';

@Injectable()
export class OtpService {
  private otpStore: Map<string, string> = new Map();

  generateOtp(phoneNumber: string): string {
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false
    });
    this.otpStore.set(phoneNumber, otp);
    console.log(`OTP for ${phoneNumber}: ${otp}`);
    return otp;
  }

  validateOtp(phoneNumber: string, otp: string): boolean {
    const storedOtp = this.otpStore.get(phoneNumber);
    if (storedOtp && storedOtp === otp) {
      this.otpStore.delete(phoneNumber);
      return true;
    }
    return false;
  }
}
