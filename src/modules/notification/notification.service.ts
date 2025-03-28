import { Injectable } from '@nestjs/common';

import { NotificationType, TokenType, type User } from '@/prisma/generated';
import { PrismaService } from '@/src/app/prisma/prisma.service';
import { ChangeNotificationsSettingsInput } from '@/src/modules/notification/inputs/change-notifications-settings.input';
import { generateToken } from '@/src/shared/utils/generate-token.util';

@Injectable()
export class NotificationService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findUnreadCount(user: User) {
    const unreadCount = await this.prismaService.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return unreadCount;
  }

  public async findNotificationsByUser(user: User) {
    await this.prismaService.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    const notifications = await this.prismaService.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications;
  }

  public async changeSettings(
    user: User,
    input: ChangeNotificationsSettingsInput,
  ) {
    const { webNotifications, telegramNotifications } = input;

    const notificationSettings =
      await this.prismaService.notificationSettings.upsert({
        where: {
          userId: user.id,
        },
        create: {
          webNotifications,
          telegramNotifications,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
        update: {
          webNotifications,
          telegramNotifications,
        },
        include: {
          user: true,
        },
      });

    if (
      notificationSettings.telegramNotifications &&
      !notificationSettings.user.telegramId
    ) {
      const telegramAuthToken = await generateToken(
        this.prismaService,
        user,
        TokenType.TELEGRAM_AUTH,
      );

      return {
        notificationSettings,
        telegramAuthToken: telegramAuthToken.token,
      };
    }

    if (
      !notificationSettings.telegramNotifications &&
      notificationSettings.user.telegramId
    ) {
      await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          telegramId: null,
        },
      });

      return {
        notificationSettings,
      };
    }

    return {
      notificationSettings,
    };
  }

  public async createStreamStart(userId: string, channel: User) {
    const notification = await this.prismaService.notification.create({
      data: {
        message: `<b className='font-medium'>Don't miss it!</b><p>Join the stream on the channel <a href='/${channel.username}' className='font-semibold'>${channel.displayName}</a></p>`,
        type: NotificationType.STREAM_START,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return notification;
  }

  public async createNewFollowing(userId: string, follower: User) {
    const notification = await this.prismaService.notification.create({
      data: {
        message: `<b className='font-medium'>You have a new follower!</b><p>This is user <a href='/${follower.username}' className='font-semibold'>${follower.displayName}</a></p>`,
        type: NotificationType.NEW_FOLLOWER,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return notification;
  }
}
