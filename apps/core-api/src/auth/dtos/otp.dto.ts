import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { AppLocale, SUPPORTED_LOCALES } from 'src/libs/i18n/i18n.constants';

// `IR` is the default region, matching how `AuthService` parses the number: a
// local `09…` number is read as Iranian and an international `+…` one is
// accepted as written. No `message:` — the client renders the constraint key.
export class SendOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber('IR')
  phoneNumber: string;

  /**
   * The locale the client already negotiated, so the OTP arrives in a language
   * the recipient reads. Not a user setting and not a choice: the PWA reports
   * what the edge decided (`docs/engine/localization.md`). Anything else — or
   * nothing at all — sends Persian.
   */
  @IsOptional()
  @IsIn(SUPPORTED_LOCALES)
  locale?: AppLocale;
}

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber('IR')
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  otp: string;

  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
