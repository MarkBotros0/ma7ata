import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+\d+$/, {
    message: 'Phone Number must start with a "+" followed by digits only.'
  })
  @MaxLength(15, { message: 'maximum phone number length is 15' })
  @ApiProperty()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  otp: string;
}
