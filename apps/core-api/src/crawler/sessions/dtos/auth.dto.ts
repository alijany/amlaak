import { IsNotEmpty, IsString, Length } from 'class-validator';

export class StartLoginDto {
  @IsNotEmpty()
  @IsString()
  phone: string;
}

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @Length(4, 6)
  otp: string;
}
