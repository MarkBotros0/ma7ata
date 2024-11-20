import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendOTPDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phoneNumber: string;
}
