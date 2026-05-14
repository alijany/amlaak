import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/user/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Assuming the user is attached to the request object after authentication
  },
);
