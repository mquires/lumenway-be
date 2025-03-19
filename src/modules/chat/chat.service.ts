import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@prisma/generated';

import { PrismaService } from '@/src/app/prisma/prisma.service';
import { ChangeChatSettingsInput } from '@/src/modules/chat/inputs/change-chat-settings.input';
import { SendMessageInput } from '@/src/modules/chat/inputs/send-message.input';

@Injectable()
export class ChatService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findMessagesByStream(streamId: string) {
    const messages = await this.prismaService.chatMessage.findMany({
      where: {
        streamId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
      },
    });

    return messages;
  }

  public async sendMessage(userId: string, input: SendMessageInput) {
    const { text, streamId } = input;

    const stream = await this.prismaService.stream.findUnique({
      where: {
        id: streamId,
      },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    if (!stream.isLive) {
      throw new BadRequestException('Stream is not live');
    }

    const message = await this.prismaService.chatMessage.create({
      data: {
        text,
        user: {
          connect: {
            id: userId,
          },
        },
        stream: {
          connect: { id: stream.id },
        },
      },
      include: {
        stream: true,
      },
    });

    return message;
  }

  public async changeChatSettings(user: User, input: ChangeChatSettingsInput) {
    const { isChatEnabled, isChatFollowersOnly, isChatPremiumFollowersOnly } =
      input;

    await this.prismaService.stream.update({
      data: {
        isChatEnabled,
        isChatFollowersOnly,
        isChatPremiumFollowersOnly,
      },
      where: {
        userId: user.id,
      },
    });

    return true;
  }
}
