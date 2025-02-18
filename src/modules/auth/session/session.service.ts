import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import { Request } from 'express';

import { PrismaService } from '@/src/app/prisma/prisma.service';
import { RedisService } from '@/src/app/redis/redis.service';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';

import { LoginInput } from './inputs/login.input';
import { SessionModel } from './models/session.model';

@Injectable()
export class SessionService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  public async findByUser(req: Request) {
    const userId = req.session.userId;

    if (!userId) {
      throw new NotFoundException('User not found in session');
    }

    const keys = await this.redisService.keys('*');

    const userSessions: SessionModel[] = [];

    for (const key of keys) {
      const sessionData = await this.redisService.get(key);

      if (sessionData) {
        const session = JSON.parse(sessionData) as SessionModel;

        if (session.userId === userId) {
          userSessions.push({
            ...session,
            id: key.split(':')[1],
          });
        }
      }
    }

    console.log('userSessions', userSessions);

    userSessions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return userSessions.filter(session => session.id !== req.session.id);
  }

  public async findCurrent(req: Request) {
    const sessionId = req.session.id;

    const sessionData = await this.redisService.get(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`,
    );

    const session = JSON.parse(sessionData) as SessionModel;

    return {
      ...session,
      id: sessionId,
    };
  }

  public clearSession(req: Request) {
    req.res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));

    return true;
  }

  public async remove(req: Request, sessionId: string) {
    if (req.session.id === sessionId) {
      throw new ConflictException('Cannot delete current session');
    }

    await this.redisService.del(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`,
    );

    return true;
  }

  public async login(req: Request, input: LoginInput, userAgent: string) {
    const { login, password } = input;

    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ username: { equals: login } }, { email: { equals: login } }],
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Incorrect password');
    }

    const metadata = getSessionMetadata(req, userAgent);

    return new Promise((resolve, reject) => {
      req.session.createdAt = new Date();
      req.session.userId = user.id;
      req.session.sessionMetadata = metadata;

      req.session.save(err => {
        if (err) {
          return reject(
            new InternalServerErrorException('Failed to save session'),
          );
        }

        resolve(user);
      });
    });
  }

  public async logout(req: Request) {
    return new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          return reject(
            new InternalServerErrorException('Failed to end session'),
          );
        }

        req.res.clearCookie(
          this.configService.getOrThrow<string>('SESSION_NAME'),
        );

        resolve(true);
      });
    });
  }
}
