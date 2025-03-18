import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { IngressInput } from 'livekit-server-sdk';

import type { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { IngressService } from './ingress.service';

@Resolver('Ingress')
export class IngressResolver {
  public constructor(private readonly ingressService: IngressService) {}

  @Authorization()
  @Mutation(() => Boolean, { name: 'createIngress' })
  public async createIngress(
    @Authorized() user: User,
    @Args('ingressType') ingressType: IngressInput,
  ) {
    return this.ingressService.createIngress(user, ingressType);
  }
}
