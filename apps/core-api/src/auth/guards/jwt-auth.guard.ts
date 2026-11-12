import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { CodedUnauthorizedException } from 'src/libs/error/error.exception.coded';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublicData = this.reflector.getAllAndOverride<{
      isPublic: boolean;
      isOptional: boolean;
    }>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublicData?.isPublic && !isPublicData.isOptional) {
      return true;
    }

    if (isPublicData?.isOptional) {
      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return result.catch(() => {
          return true;
        });
      }
      // For non-promise results (e.g. from cache, which is not the case for jwt)
      // we can't really "catch" an error. But AuthGuard('jwt') returns a promise.
      // If it's not a promise, and it's false, we still allow access.
      if (result === false) {
        return true;
      }
    }

    return super.canActivate(context);
  }

  /**
   * Codes the refusal Passport itself produces.
   *
   * `JwtStrategy.validate()` throws coded exceptions, but it only runs for a
   * token that verified. An expired, malformed or absent one is rejected before
   * that, and the stock guard answers a bare `UnauthorizedException` with no
   * code — which is every session expiry, the most common failure in the app.
   *
   * The two reasons are kept apart because a reader can act on the difference:
   * an expired session means sign in again, an invalid one means the request
   * never carried a usable token.
   */
  handleRequest<TUser>(err: unknown, user: TUser, info: unknown): TUser {
    if (user) return user;
    if (err) throw err;

    const expired = info instanceof Error && info.name === 'TokenExpiredError';

    throw new CodedUnauthorizedException(
      expired ? 'auth.session.expired' : 'auth.session.invalid',
      expired
        ? 'Your session has expired. Sign in again.'
        : 'Your session is not valid. Sign in again.',
    );
  }
}
