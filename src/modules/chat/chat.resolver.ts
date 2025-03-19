import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { User } from '@/prisma/generated';
import { ChangeChatSettingsInput } from '@/src/modules/chat/inputs/change-chat-settings.input';
import { SendMessageInput } from '@/src/modules/chat/inputs/send-message.input';
import { ChatMessageModel } from '@/src/modules/chat/models/chat-message.model';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { ChatService } from './chat.service';

@Resolver('Chat')
export class ChatResolver {
  private readonly pubSub: PubSub;

  public constructor(private readonly chatService: ChatService) {
    this.pubSub = new PubSub();
  }

  @Query(() => [ChatMessageModel], { name: 'findMessagesByStream' })
  public async findMessagesByStream(@Args('streamId') streamId: string) {
    return this.chatService.findMessagesByStream(streamId);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'changeChatSettings' })
  public async changeChatSettings(
    @Authorized() user: User,
    @Args('data') input: ChangeChatSettingsInput,
  ) {
    return this.chatService.changeChatSettings(user, input);
  }

  @Authorization()
  @Mutation(() => ChatMessageModel, { name: 'sendChatMessage' })
  public async sendMessage(
    @Authorized('id') userId: string,
    @Args('data') input: SendMessageInput,
  ) {
    const message = await this.chatService.sendMessage(userId, input);

    await this.pubSub.publish('CHAT_MESSAGE_ADDED', {
      chatMessageAdded: message,
    });

    return message;
  }

  @Subscription(() => ChatMessageModel, {
    name: 'chatMessageAdded',
    filter: (
      payload: { chatMessageAdded: ChatMessageModel },
      variables: { streamId: string },
    ) => {
      return payload.chatMessageAdded.streamId === variables.streamId;
    },
  })
  public chatMessageAdded(@Args('streamId') streamId: string) {
    return this.pubSub.asyncIterableIterator('CHAT_MESSAGE_ADDED');
  }
}
