import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { getLiveKitConfig } from '@/src/app/config/livekit.config';
import { CategoryModule } from '@/src/modules/category/category.module';
import { ChannelModule } from '@/src/modules/channel/channel.module';
import { ChatModule } from '@/src/modules/chat/chat.module';
import { FollowModule } from '@/src/modules/follow/follow.module';
import { LivekitModule } from '@/src/modules/libs/livekit/livekit.module';
import { TelegramModule } from '@/src/modules/libs/telegram/telegram.module';
import { NotificationModule } from '@/src/modules/notification/notification.module';
import { IngressModule } from '@/src/modules/stream/ingress/ingress.module';
import { StreamModule } from '@/src/modules/stream/stream.module';
import { WebhookModule } from '@/src/modules/webhook/webhook.module';

import { AccountModule } from '../modules/auth/account/account.module';
import { DeactivateModule } from '../modules/auth/deactivate/deactivate.module';
import { PasswordRecoveryModule } from '../modules/auth/password-recovery/password-recovery.module';
import { ProfileModule } from '../modules/auth/profile/profile.module';
import { SessionModule } from '../modules/auth/session/session.module';
import { TotpModule } from '../modules/auth/totp/totp.module';
import { VerificationModule } from '../modules/auth/verification/verification.module';
import { CronModule } from '../modules/cron/cron.module';
import { MailModule } from '../modules/libs/mail/mail.module';
import { S3Module } from '../modules/libs/s3/s3.module';
import { IS_DEV_ENV } from '../shared/utils/is-dev.util';

import { getGraphqlConfig } from './config/graphql.config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: !IS_DEV_ENV,
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: getGraphqlConfig,
      inject: [ConfigService],
    }),
    PrismaModule,
    RedisModule,
    MailModule,
    S3Module,
    LivekitModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getLiveKitConfig,
      inject: [ConfigService],
    }),
    TelegramModule,
    AccountModule,
    SessionModule,
    VerificationModule,
    PasswordRecoveryModule,
    ProfileModule,
    TotpModule,
    DeactivateModule,
    CronModule,
    StreamModule,
    IngressModule,
    WebhookModule,
    CategoryModule,
    ChatModule,
    FollowModule,
    ChannelModule,
    NotificationModule,
  ],
})
export class AppModule {}
