import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a property name was passed (like 'id' or 'email'), return just that property
    if (data && user) {
      return user[data];
    }
    
    // Otherwise, return the whole user object
    return user;
  },
);