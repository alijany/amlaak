import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CodedUnauthorizedException } from 'src/libs/error/error.exception.coded';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../types/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub) {
      throw new CodedUnauthorizedException(
        'auth.token.invalid_payload',
        'Invalid token payload',
      );
    }

    try {
      const userId = Number(payload.sub);
      const user = await this.userService.findOne(
        { id: userId },
        {
          populate: ['roles'] as never,
        },
      );

      if (!user) {
        throw new CodedUnauthorizedException(
          'auth.user.not_found',
          'User not found',
        );
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new CodedUnauthorizedException(
        'auth.token.authentication_failed',
        'Failed to authenticate token',
      );
    }
  }
}
