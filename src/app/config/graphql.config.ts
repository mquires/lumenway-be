import type { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { join } from 'path';

import { isDev } from '@/src/shared/utils/is-dev.util';

/**
 * Creates Apollo Server configuration for GraphQL
 * @param configService - NestJS config service for accessing environment variables
 * @returns Apollo driver configuration object
 */

export const getGraphqlConfig = (
  configService: ConfigService,
): ApolloDriverConfig => {
  return {
    playground: isDev(configService),
    path: configService.getOrThrow<string>('GRAPHQL_PREFIX'),
    autoSchemaFile: join(process.cwd(), 'src/app/graphql/schema.gql'),
    sortSchema: true,
    context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
    installSubscriptionHandlers: true,
  };
};
