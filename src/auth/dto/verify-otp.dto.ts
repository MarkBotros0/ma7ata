import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOTPDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  otpCode: string;
}
