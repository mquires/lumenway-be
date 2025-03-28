import { type MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { NotificationService } from '@/src/modules/notification/notification.service';
import { RawBodyMiddleware } from '@/src/shared/middlewares/raw-body.middleware';

import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService, NotificationService],
})
export class WebhookModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: 'webhook/livekit', method: RequestMethod.POST });
  }
}
