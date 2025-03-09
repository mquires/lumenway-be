import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

/**
 * Decorator to extract User-Agent header from request
 * Supports both HTTP and GraphQL contexts
 * @returns User-Agent string or undefined if not present
 */
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
