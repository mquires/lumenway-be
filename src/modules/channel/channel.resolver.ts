import { Args, Query, Resolver } from '@nestjs/graphql';

import { UserModel } from '@/src/modules/auth/account/models/user.model';

import { ChannelService } from './channel.service';

@Resolver('Channel')
export class ChannelResolver {
  public constructor(private readonly channelService: ChannelService) {}

  @Query(() => [UserModel], { name: 'findRecommendedChannels' })
  public async findRecommendedChannels() {
    return this.channelService.findRecommendedChannels();
  }

  @Query(() => UserModel, { name: 'findChannelByUsername' })
  public async findChannelByUsername(@Args('username') username: string) {
    return this.channelService.findChannelByUsername(username);
  }

  @Query(() => Number, { name: 'findFollowersCountByChannel' })
  public async findFollowersCountByChannel(
    @Args('channelId') channelId: string,
  ) {
    return this.channelService.findFollowersCountByChannel(channelId);
  }
}
