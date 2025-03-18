import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Upload from 'graphql-upload/Upload.js';
import { AccessToken } from 'livekit-server-sdk';
import * as sharp from 'sharp';

import type { Prisma, User } from '@/prisma/generated';
import { PrismaService } from '@/src/app/prisma/prisma.service';
import { S3Service } from '@/src/modules/libs/s3/s3.service';
import { ChangeStreamInfoInput } from '@/src/modules/stream/inputs/change-stream-info.input';
import { FiltersInput } from '@/src/modules/stream/inputs/filters.input';
import { GenerateStreamTokenInput } from '@/src/modules/stream/inputs/generate-stream-token.input';

@Injectable()
export class StreamService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  public async findAll(input: FiltersInput = {}) {
    const { take, skip, searchTerm } = input;

    const whereClause = searchTerm
      ? this.findBySearchTermFilter(searchTerm)
      : undefined;

    const streams = await this.prismaService.stream.findMany({
      take: take ?? 12,
      skip: skip ?? 0,
      where: {
        user: {
          isDeactivated: false,
        },
        ...whereClause,
      },
      include: {
        user: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return streams;
  }

  public async findRandom() {
    const total = await this.prismaService.stream.count({
      where: {
        user: {
          isDeactivated: false,
        },
      },
    });

    const randomIndexes = new Set<number>();

    while (randomIndexes.size < 4) {
      const randomIndex = Math.floor(Math.random() * total);

      randomIndexes.add(randomIndex);
    }

    const streams = await this.prismaService.stream.findMany({
      where: {
        user: {
          isDeactivated: false,
        },
      },
      include: {
        user: true,
        category: true,
      },
      take: total,
      skip: 0,
    });

    return Array.from(randomIndexes).map(index => streams[index]);
  }

  public async changeStreamInfo(user: User, input: ChangeStreamInfoInput) {
    const { title, categoryId } = input;

    await this.prismaService.stream.update({
      where: {
        userId: user.id,
      },
      data: {
        title,
        category: {
          connect: {
            id: categoryId,
          },
        },
      },
    });

    return true;
  }

  public async changeThumbnail(user: User, file: Upload) {
    const stream = await this.findStreamByUserId(user);

    if (stream.thumbnailUrl) {
      await this.s3Service.remove(stream.thumbnailUrl);
    }

    const chunks: Buffer[] = [];

    for await (const chunk of file.createReadStream()) {
      chunks.push(chunk as Buffer);
    }

    const buffer = Buffer.concat(chunks);

    const isGif = (file.filename?.endsWith('.gif') || false) as boolean;
    const processedBuffer = await this.processFile(buffer, isGif);

    const fileName = `/streams/${user.username}.webp`;

    await this.s3Service.upload(processedBuffer, fileName, 'image/webp');

    await this.prismaService.stream.update({
      where: {
        userId: user.id,
      },
      data: {
        thumbnailUrl: fileName,
      },
    });

    return true;
  }

  public async removeThumbnail(user: User) {
    const stream = await this.findStreamByUserId(user);

    if (!stream.thumbnailUrl) return;

    await this.s3Service.remove(stream.thumbnailUrl);

    await this.prismaService.stream.update({
      where: {
        userId: user.id,
      },
      data: {
        thumbnailUrl: null,
      },
    });

    return true;
  }

  public async generateStreamToken(input: GenerateStreamTokenInput) {
    const { userId, channelId } = input;

    let self: { id: string; username: string };

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user) {
      self = { id: user.id, username: user.username };
    } else {
      self = {
        id: userId,
        username: `Viewer ${Math.floor(Math.random() * 100000)}`,
      };
    }

    const channel = await this.prismaService.user.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const isHost = self.id === channel.id;

    const token = new AccessToken(
      this.configService.getOrThrow<string>('LIVEKIT_API_KEY'),
      this.configService.getOrThrow<string>('LIVEKIT_API_SECRET'),
      {
        identity: isHost ? `Host-${self.id}` : self.id.toString(),
        name: self.username,
      },
    );

    token.addGrant({
      room: channel.id,
      roomJoin: true,
      canPublish: false,
    });

    return { token: token.toJwt() };
  }

  private async processFile(buffer: Buffer, isGif: boolean): Promise<Buffer> {
    const image = sharp(buffer, isGif ? { animated: true } : undefined);

    return image.resize(1280, 720).webp().toBuffer();
  }

  private async findStreamByUserId(user: User) {
    const stream = await this.prismaService.stream.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return stream;
  }

  private findBySearchTermFilter(searchTerm: string): Prisma.StreamWhereInput {
    return {
      OR: [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
          user: {
            username: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ],
    };
  }
}
