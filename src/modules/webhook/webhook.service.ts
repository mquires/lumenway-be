import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/src/app/prisma/prisma.service';
import { LivekitService } from '@/src/modules/libs/livekit/livekit.service';
import { TelegramService } from '@/src/modules/libs/telegram/telegram.service';
import { NotificationService } from '@/src/modules/notification/notification.service';
import { WebhookLivekitEvents } from '@/src/modules/webhook/types/webhook-livekit-event.types';

@Injectable()
export class WebhookService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly livekitService: LivekitService,
    private readonly notificationService: NotificationService,
    private readonly telegramService: TelegramService,
  ) {}

  public async receiveWebhookLivekit(body: string, auth: string) {
    const event = this.livekitService.receiver.receive(body, auth, true);

    if (event.event === WebhookLivekitEvents.INGRESS_STARTED) {
      const stream = await this.prismaService.stream.update({
        where: {
          ingressId: event.ingressInfo.ingressId,
        },
        data: {
          isLive: true,
        },
        include: {
          user: true,
        },
      });

      const followers = await this.prismaService.follow.findMany({
        where: {
          followerId: stream.user.id,
          follower: {
            isDeactivated: false,
          },
        },
        include: {
          follower: {
            include: {
              notificationSettings: true,
            },
          },
        },
      });

      for (const follow of followers) {
        const follower = follow.follower;

        if (follower.notificationSettings.webNotifications) {
          await this.notificationService.createStreamStart(
            follower.id,
            stream.user,
          );
        }

        if (follower.notificationSettings.telegramNotifications) {
          await this.telegramService.sendStreamStart(
            follower.telegramId,
            stream.user,
          );
        }
      }
    }

    if (event.event === WebhookLivekitEvents.INGRESS_ENDED) {
      const stream = await this.prismaService.stream.update({
        where: {
          ingressId: event.ingressInfo.ingressId,
        },
        data: {
          isLive: false,
        },
      });

      await this.prismaService.chatMessage.deleteMany({
        where: {
          streamId: stream.id,
        },
      });
    }
  }
}
