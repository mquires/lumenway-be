import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { User } from '@/prisma/generated';
import { PrismaService } from '@/src/app/prisma/prisma.service';

interface ActivateRequest extends Request {
  session: {
    userId?: string;
  };
  user: User;
}

@Injectable()
export class GqlAuthGuard implements CanActivate {
  public constructor(private readonly prismaService: PrismaService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext<{ req: ActivateRequest }>().req;

    if (typeof request.session.userId === 'undefined') {
      throw new UnauthorizedException('User not authorized');
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: request.session.userId,
      },
    });

    request.user = user;

    return true;
  }
}
