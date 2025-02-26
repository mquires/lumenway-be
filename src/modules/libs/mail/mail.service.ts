import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/components';
import { SentMessageInfo } from 'nodemailer';

import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';
import { PasswordRecoveryTemplate } from './templates/password-recovery.template';
import { VerificationTemplate } from './templates/verification.template';

@Injectable()
export class MailService {
  public constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public async sendVerificationToken(
    email: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
    const html = await render(VerificationTemplate({ domain, token }));

    return this.sendMail(email, 'Account verification', html);
  }

  public async sendResetPasswordToken(
    email: string,
    token: string,
    metadata: SessionMetadata,
  ): Promise<SentMessageInfo> {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
    const html = await render(
      PasswordRecoveryTemplate({ domain, token, metadata }),
    );

    return this.sendMail(email, 'Reset password', html);
  }

  private sendMail(
    email: string,
    subject: string,
    html: string,
  ): Promise<SentMessageInfo> {
    return this.mailerService.sendMail({
      to: email,
      subject,
      html,
    });
  }
}
