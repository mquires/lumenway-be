import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { User } from '@/prisma/generated';
import { PrismaService } from '@/src/app/prisma/prisma.service';
import { TelegramService } from '@/src/modules/libs/telegram/telegram.service';
import { NotificationService } from '@/src/modules/notification/notification.service';

@Injectable()
export class FollowService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly telegramService: TelegramService,
  ) {}

  public async findMyFollowers(user: User) {
    const followers = await this.prismaService.follow.findMany({
      where: {
        followingId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        follower: true,
      },
    });

    return followers;
  }

  public async findMyFollowings(user: User) {
    const followings = await this.prismaService.follow.findMany({
      where: {
        followerId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        following: true,
      },
    });

    return followings;
  }

  public async follow(user: User, channelId: string) {
    const channel = await this.prismaService.user.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.id === user.id) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existingFollow = await this.prismaService.follow.findFirst({
      where: {
        followerId: user.id,
        followingId: channel.id,
      },
    });

    if (existingFollow) {
      throw new BadRequestException('You are already following this channel');
    }

    const follow = await this.prismaService.follow.create({
      data: {
        followerId: user.id,
        followingId: channel.id,
      },
      include: {
        follower: true,
        following: {
          include: {
            notificationSettings: true,
          },
        },
      },
    });

    if (follow.following.notificationSettings.webNotifications) {
      await this.notificationService.createNewFollowing(
        follow.following.id,
        follow.follower,
      );
    }

    if (
      follow.following.notificationSettings.telegramNotifications &&
      follow.following.telegramId
    ) {
      await this.telegramService.sendNewFollowing(
        follow.following.telegramId,
        follow.follower,
      );
    }

    return true;
  }

  public async unfollow(user: User, channelId: string) {
    const channel = await this.prismaService.user.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.id === user.id) {
      throw new BadRequestException('You cannot unfollow yourself');
    }

    const existingFollow = await this.prismaService.follow.findFirst({
      where: {
        followerId: user.id,
        followingId: channel.id,
      },
    });

    if (!existingFollow) {
      throw new BadRequestException('You are not following this channel');
    }

    await this.prismaService.follow.delete({
      where: {
        id: existingFollow.id,
        followerId: user.id,
        followingId: channel.id,
      },
    });

    return true;
  }
}
