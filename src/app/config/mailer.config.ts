import type { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

/**
 * Creates Mailer configuration for NestJS
 * @param configService - NestJS config service for accessing environment variables
 * @returns Mailer configuration object
 */

export const getMailerConfig = (
  configService: ConfigService,
): MailerOptions => {
  return {
    transport: {
      host: configService.getOrThrow<string>('MAIL_HOST'),
      port: configService.getOrThrow<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: configService.getOrThrow<string>('MAIL_LOGIN'),
        pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
      },
    },
    defaults: {
      from: `Lumenway ${configService.getOrThrow<string>('MAIL_LOGIN')}`,
    },
  };
};
