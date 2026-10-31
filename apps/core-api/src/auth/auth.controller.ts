import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CodedUnauthorizedException } from 'src/libs/error/error.exception.coded';
import { formPipes } from 'src/libs/error/error.pipe.validation';
import { UserEntity } from '../user/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenDto, SendOtpDto, VerifyOtpDto } from './dtos/otp.dto'; // Import OTP DTOs and RefreshTokenDto
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdatePhoneDto } from 'src/user/dtos/update-profile.dto';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: UserEntity) {
    return user;
  }

  // --- OTP Endpoints ---

  @Post('otp/send')
  async sendOtp(@Body(...formPipes) sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.phoneNumber, sendOtpDto.locale);
  }

  @Post('otp/verify')
  async verifyOtp(@Body(...formPipes) verifyOtpDto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(
      verifyOtpDto.phoneNumber,
      verifyOtpDto.otp,
      verifyOtpDto.deviceId,
    );

    // Return access token, refresh token and user info
    return {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      isNewUser: result.isNewUser,
      user: result.user,
    };
  }

  @Post('refresh')
  async refreshToken(@Body(...formPipes) refreshTokenDto: RefreshTokenDto) {
    const refreshToken = refreshTokenDto.refresh_token;

    if (!refreshToken) {
      throw new CodedUnauthorizedException(
        'auth.token.refresh_missing',
        'Refresh token not found',
      );
    }

    const result = await this.authService.refreshTokens(
      refreshToken,
      refreshTokenDto.deviceId,
    );

    // Return new access token, refresh token and user info
    return {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      user: result.user,
    };
  }

  @Patch('profile/phone')
  async updatePhoneNumber(
    @CurrentUser() user: UserEntity,
    @Body(...formPipes) updatePhoneDto: UpdatePhoneDto,
  ) {
    // Verify OTP first
    await this.authService.verifyOtpForPhoneChange(
      updatePhoneDto.phoneNumber,
      updatePhoneDto.otp,
    );

    // Update phone number
    const updatedUser = await this.userService.updatePhoneNumber(
      user.id,
      updatePhoneDto.phoneNumber,
    );

    return updatedUser;
  }
}
