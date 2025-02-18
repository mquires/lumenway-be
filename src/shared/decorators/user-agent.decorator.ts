import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    if (ctx.getType() === 'http') {
      const request = ctx.switchToHttp().getRequest<Request>();

      return request?.headers?.['user-agent'] ?? undefined;
    } else {
      const context = GqlExecutionContext.create(ctx);
      const gqlContext = context.getContext<{ req?: Request }>();

      return gqlContext?.req?.headers?.['user-agent'] ?? undefined;
    }
  },
);
