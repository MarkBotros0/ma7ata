import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthService } from './services/auth.service';
import { SendOTPDto } from './dto/send-otp.dto';
import { OtpService } from './services/otp.service';
import { AuthDto } from './dto/auth.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
@ApiSecurity('apiKey')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService
  ) {}

  @Post('send-otp')
  async sendOtpCode(@Req() req, @Body() body: SendOTPDto) {
    await this.otpService.sendOtp(body.phoneNumber);
    return {
      message: 'Otp code has been sent successfully.'
    };
  }

  @Post('register')
  async signUp(@Req() req, @Body() body: AuthDto) {
    return this.authService.signUp(body);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(@Req() req) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
