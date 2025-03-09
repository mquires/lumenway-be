import { applyDecorators, UseGuards } from '@nestjs/common';

import { GqlAuthGuard } from '../guards/gql-auth.guard';

/**
 * Decorator for protecting GraphQL resolvers with authentication
 * Applies GqlAuthGuard to ensure request is authenticated
 */
export const Authorization = () => {
  return applyDecorators(UseGuards(GqlAuthGuard));
};
