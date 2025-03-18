import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  public constructor(private readonly webhookService: WebhookService) {}

  @Post('livekit')
  @HttpCode(HttpStatus.OK)
  public async receiveWebhookLivekit(
    @Body() body: string,
    @Headers('Authorization') auth: string,
  ) {
    if (!auth) {
      throw new UnauthorizedException('Authorization header is required');
    }

    return await this.webhookService.receiveWebhookLivekit(body, auth);
  }
}
