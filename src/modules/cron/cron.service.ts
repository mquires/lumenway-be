import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '@/src/app/prisma/prisma.service';
import { TelegramService } from '@/src/modules/libs/telegram/telegram.service';

import { MailService } from '../libs/mail/mail.service';
import { S3Service } from '../libs/s3/s3.service';

@Injectable()
export class CronService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly s3Service: S3Service,
    private readonly telegramService: TelegramService,
  ) {}

  @Cron('0 0 * * *')
  public async deleteDeactivatedAccounts() {
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDay() - 7);

    const deactivatedAccounts = await this.prismaService.user.findMany({
      where: {
        isDeactivated: true,
        deactivatedAt: {
          lte: sevenDaysAgo,
        },
      },
      include: {
        notificationSettings: true,
        stream: true,
      },
    });

    for (const user of deactivatedAccounts) {
      await this.mailService.sendAccountDeletion(user.email);

      if (user.notificationSettings.telegramNotifications && user.telegramId) {
        await this.telegramService.sendAccountDeletion(user.telegramId);
      }

      if (user.avatar) {
        await this.s3Service.remove(user.avatar);
      }

      if (user.stream.thumbnailUrl) {
        await this.s3Service.remove(user.stream.thumbnailUrl);
      }
    }

    await this.prismaService.user.deleteMany({
      where: {
        isDeactivated: true,
        deactivatedAt: {
          lte: sevenDaysAgo,
        },
      },
    });
  }
}
