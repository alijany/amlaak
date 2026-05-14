import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
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
}
