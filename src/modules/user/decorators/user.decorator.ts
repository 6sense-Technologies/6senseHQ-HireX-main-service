import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfoDto } from '../dto/user.dto';

export const UserInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInfoDto => {
    const request = ctx.switchToHttp().getRequest();
    return {
      userId: request.user.userId,
      email: request.user.email,
    };
  },
);
