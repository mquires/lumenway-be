import { Inject, Injectable } from '@nestjs/common';
import {
  IngressClient,
  RoomServiceClient,
  WebhookReceiver,
} from 'livekit-server-sdk';

import {
  LiveKitOptionsSymbol,
  TypeLiveKitOptions,
} from '@/src/modules/libs/livekit/types/livekit.types';

@Injectable()
export class LivekitService {
  private roomService: RoomServiceClient;
  private ingressClient: IngressClient;
  private webhookReceiver: WebhookReceiver;

  constructor(
    @Inject(LiveKitOptionsSymbol)
    private readonly options: TypeLiveKitOptions,
  ) {
    this.roomService = new RoomServiceClient(
      this.options.apiUrl,
      this.options.apiKey,
      this.options.apiSecret,
    );

    this.ingressClient = new IngressClient(this.options.apiUrl);

    this.webhookReceiver = new WebhookReceiver(
      this.options.apiKey,
      this.options.apiSecret,
    );
  }

  public get ingress(): IngressClient {
    return this.createProxy(this.ingressClient);
  }

  public get room(): RoomServiceClient {
    return this.createProxy(this.roomService);
  }

  public get receiver(): WebhookReceiver {
    return this.createProxy(this.webhookReceiver);
  }

  private createProxy<T extends object>(target: T) {
    return new Proxy(target, {
      get: (obj, prop: string | symbol) => {
        const value = obj[prop as keyof T];

        if (typeof value === 'function') {
          return value.bind(obj) as T[Extract<typeof prop, keyof T>];
        }

        return value;
      },
    });
  }
}
