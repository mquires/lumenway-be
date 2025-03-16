import { ConflictException, Injectable } from '@nestjs/common';
import * as Upload from 'graphql-upload/Upload.js';
import * as sharp from 'sharp';

import type { User } from '@/prisma/generated';
import { PrismaService } from '@/src/app/prisma/prisma.service';
import {
  SocialLinkInput,
  SocialLinkOrderInput,
} from '@/src/modules/auth/profile/inputs/social-link.input';

// Prisma auto-generated types

import { S3Service } from '../../libs/s3/s3.service';

import { ChangeProfileInfoInput } from './inputs/change-profile-info.input';

@Injectable()
export class ProfileService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  private async processFile(buffer: Buffer, isGif: boolean): Promise<Buffer> {
    const image = sharp(buffer, isGif ? { animated: true } : undefined);

    return image.resize(512, 512).webp().toBuffer();
  }

  public async changeAvatar(user: User, file: Upload) {
    if (user.avatar) {
      await this.s3Service.remove(user.avatar);
    }

    const chunks: Buffer[] = [];

    for await (const chunk of file.createReadStream()) {
      chunks.push(chunk as Buffer);
    }

    const buffer = Buffer.concat(chunks);

    const isGif = (file.filename?.endsWith('.gif') || false) as boolean;
    const processedBuffer = await this.processFile(buffer, isGif);

    const fileName = `/channels/${user.username}.webp`;

    await this.s3Service.upload(processedBuffer, fileName, 'image/webp');

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: fileName,
      },
    });

    return true;
  }

  public async removeAvatar(user: User) {
    if (!user.avatar) return;

    await this.s3Service.remove(user.avatar);

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: null,
      },
    });

    return true;
  }

  public async changeInfo(user: User, input: ChangeProfileInfoInput) {
    const { username, displayName, bio } = input;

    const usernameExists = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    if (usernameExists && username !== user.username) {
      throw new ConflictException('This username already exists');
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        username,
        displayName,
        bio,
      },
    });

    return true;
  }

  public async getSocialLinks(user: User) {
    const socialLinks = await this.prismaService.socialLink.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        position: 'asc',
      },
    });

    return socialLinks;
  }

  public async createSocialLink(user: User, input: SocialLinkInput) {
    const { title, url } = input;

    const lastSocialLink = await this.prismaService.socialLink.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        position: 'desc',
      },
    });

    const newPosition = lastSocialLink ? lastSocialLink.position + 1 : 1;

    await this.prismaService.socialLink.create({
      data: {
        title,
        url,
        position: newPosition,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return true;
  }

  public async reorderSocialLinks(input: SocialLinkOrderInput[]) {
    if (!input.length) return;

    const updateSocialLinkPromises = input.map(socialLink => {
      return this.prismaService.socialLink.update({
        where: { id: socialLink.id },
        data: {
          position: socialLink.position,
        },
      });
    });

    await Promise.all(updateSocialLinkPromises);

    return true;
  }

  public async updateSocialLink(id: string, input: SocialLinkInput) {
    const { title, url } = input;

    await this.prismaService.socialLink.update({
      where: {
        id,
      },
      data: {
        title,
        url,
      },
    });

    return true;
  }

  public async deleteSocialLink(id: string) {
    await this.prismaService.socialLink.delete({
      where: {
        id,
      },
    });

    return true;
  }
}
