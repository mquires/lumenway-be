import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/src/app/prisma/prisma.service';
import { LivekitService } from '@/src/modules/libs/livekit/livekit.service';

@Injectable()
export class WebhookService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly livekitService: LivekitService,
  ) {}

  public async receiveWebhookLivekit(body: string, auth: string) {
    const event = this.livekitService.receiver.receive(body, auth, true);

    if (event.event === 'ingress_started') {
      await this.prismaService.stream.update({
        where: {
          ingressId: event.ingressInfo.ingressId,
        },
        data: {
          isLive: true,
        },
      });
    }

    if (event.event === 'ingress_ended') {
      await this.prismaService.stream.update({
        where: {
          ingressId: event.ingressInfo.ingressId,
        },
        data: {
          isLive: false,
        },
      });
    }
  }
}
