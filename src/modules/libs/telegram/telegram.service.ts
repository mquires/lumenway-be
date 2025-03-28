import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Action, Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

import { TokenType, type User } from '@/prisma/generated';
import { PrismaService } from '@/src/app/prisma/prisma.service';
import { BUTTONS } from '@/src/modules/libs/telegram/telegram.buttons';
import { MESSAGES } from '@/src/modules/libs/telegram/telegram.messages';
import { SessionMetadata } from '@/src/shared/types/session-metadata.types';

interface TelegramContext extends Context {
  chat: NonNullable<Context['chat']>;
  message: NonNullable<Context['message']> & { text: string };
}

@Update()
@Injectable()
export class TelegramService extends Telegraf {
  private readonly _token: string;

  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super(configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'));
    this._token = configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
  }

  @Start()
  public async onStart(@Ctx() ctx: TelegramContext) {
    const chatId = ctx.chat.id.toString();
    const token = ctx.message.text.split(' ')?.[1];

    if (token) {
      const authToken = await this.prismaService.token.findUnique({
        where: {
          token,
          type: TokenType.TELEGRAM_AUTH,
        },
      });

      if (!authToken) {
        await ctx.reply(MESSAGES.notFoundToken);
      }

      const hasExpired = new Date(authToken.expiresIn) < new Date();

      if (hasExpired) {
        await ctx.reply(MESSAGES.invalidToken);
      }

      await this.connectTelegram(authToken.userId, chatId);

      await this.prismaService.token.delete({
        where: {
          id: authToken.id,
        },
      });

      await ctx.replyWithHTML(MESSAGES.authSuccess, BUTTONS.authSuccess);
    } else {
      const user = await this.findUserByChatId(chatId);

      if (user) {
        await this.onMe(ctx);
      } else {
        await ctx.replyWithHTML(MESSAGES.welcome, BUTTONS.profile);
      }
    }
  }

  @Command('me')
  @Action('me')
  public async onMe(@Ctx() ctx: Context) {
    const chatId = ctx.chat.id.toString();

    const user = await this.findUserByChatId(chatId);

    const followersCount = await this.prismaService.follow.count({
      where: {
        followingId: user.id,
      },
    });

    await ctx.replyWithHTML(
      MESSAGES.profile(user, followersCount),
      BUTTONS.profile,
    );
  }

  @Command('follows')
  @Action('follows')
  public async onFollows(@Ctx() ctx: Context) {
    const chatId = ctx.chat.id.toString();

    const user = await this.findUserByChatId(chatId);
    const follows = await this.prismaService.follow.findMany({
      where: {
        followerId: user.id,
      },
      include: {
        following: true,
      },
    });

    if (user && follows.length) {
      const followsList = follows
        .map(follow => MESSAGES.follows(follow.following))
        .join('\n');

      const message = `<b>channels you are subscribed to:</b>
        \n\n${followsList}`;

      await ctx.replyWithHTML(message);
    } else {
      await ctx.replyWithHTML('<b>You have no subscriptions.</b>');
    }
  }

  public sendPasswordResetToken = async (
    chatId: string,
    token: string,
    metadata: SessionMetadata,
  ) => {
    await this.telegram.sendMessage(
      chatId,
      MESSAGES.resetPassword(token, metadata),
      { parse_mode: 'HTML' },
    );
  };

  public sendDeactivateToken = async (
    chatId: string,
    token: string,
    metadata: SessionMetadata,
  ) => {
    await this.telegram.sendMessage(
      chatId,
      MESSAGES.deactivate(token, metadata),
      { parse_mode: 'HTML' },
    );
  };

  public sendAccountDeletion = async (chatId: string) => {
    await this.telegram.sendMessage(chatId, MESSAGES.accountDeleted, {
      parse_mode: 'HTML',
    });
  };

  public sendStreamStart = async (chatId: string, channel: User) => {
    await this.telegram.sendMessage(chatId, MESSAGES.streamStart(channel), {
      parse_mode: 'HTML',
    });
  };

  public sendNewFollowing = async (chatId: string, follower: User) => {
    const user = await this.findUserByChatId(chatId);

    await this.telegram.sendMessage(
      chatId,
      MESSAGES.newFollowing(follower, user.followings.length),
      {
        parse_mode: 'HTML',
      },
    );
  };

  private connectTelegram = async (userId: string, chatId: string) => {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        telegramId: chatId,
      },
    });
  };

  private async findUserByChatId(chatId: string) {
    return await this.prismaService.user.findUnique({
      where: {
        telegramId: chatId,
      },
      include: {
        followers: true,
        followings: true,
      },
    });
  }
}
