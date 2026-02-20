import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

// This part will help us to get req.user easily. Helpful for identifying
// server side registered user without needing to redundantly perform DB request operation

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);