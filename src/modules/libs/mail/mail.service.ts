import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/components';
import { SentMessageInfo } from 'nodemailer';

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
