import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import * as Upload from 'graphql-upload/Upload.js';

import type { User } from '@/prisma/generated';
import {
  SocialLinkInput,
  SocialLinkOrderInput,
} from '@/src/modules/auth/profile/inputs/social-link.input';
import { SocialLinkModel } from '@/src/modules/auth/profile/models/social-link.model';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { FileValidationPipe } from '@/src/shared/pipes/file-validation.pipe';

import { ChangeProfileInfoInput } from './inputs/change-profile-info.input';
import { ProfileService } from './profile.service';

@Resolver('Profile')
export class ProfileResolver {
  public constructor(private readonly profileService: ProfileService) {}

  @Authorization()
  @Mutation(() => Boolean, { name: 'changeProfileAvatar' })
  public async changeAvatar(
    @Authorized() user: User,
    @Args('avatar', { type: () => GraphQLUpload }, FileValidationPipe)
    avatar: Upload,
  ) {
    return this.profileService.changeAvatar(user, avatar);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'removeProfileAvatar' })
  public async removeAvatar(@Authorized() user: User) {
    return this.profileService.removeAvatar(user);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'changeProfileInfo' })
  public async changeInfo(
    @Authorized() user: User,
    @Args('data') input: ChangeProfileInfoInput,
  ) {
    return this.profileService.changeInfo(user, input);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'createSocialLink' })
  public async createSocialLink(
    @Authorized() user: User,
    @Args('data') input: SocialLinkInput,
  ) {
    return this.profileService.createSocialLink(user, input);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'reorderSocialLinks' })
  public async reorderSocialLinks(
    @Args('list', { type: () => [SocialLinkOrderInput] })
    input: SocialLinkOrderInput[],
  ) {
    return this.profileService.reorderSocialLinks(input);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'updateSocialLink' })
  public async updateSocialLink(
    @Args('id') id: string,
    @Args('data') input: SocialLinkInput,
  ) {
    return this.profileService.updateSocialLink(id, input);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'deleteSocialLink' })
  public async deleteSocialLink(@Args('id') id: string) {
    return this.profileService.deleteSocialLink(id);
  }

  @Authorization()
  @Query(() => [SocialLinkModel], { name: 'getSocialLinks' })
  public async getSocialLinks(@Authorized() user: User) {
    return this.profileService.getSocialLinks(user);
  }
}
