import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { User } from '@/prisma/generated';

interface AuthorizedRequest extends Request {
  user: User;
}

export const Authorized = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    let user: User;

    if (ctx.getType() === 'http') {
      user = ctx.switchToHttp().getRequest<AuthorizedRequest>().user;
    } else {
      const context = GqlExecutionContext.create(ctx);
      user = context.getContext<{ req: AuthorizedRequest }>().req.user;
    }

    return data ? user[data] : user;
  },
);
