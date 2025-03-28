import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import type { User } from '@/prisma/generated';
import { ChangeNotificationsSettingsInput } from '@/src/modules/notification/inputs/change-notifications-settings.input';
import { ChangeNotificationsSettingsResponse } from '@/src/modules/notification/models/notification-settings.model';
import { NotificationModel } from '@/src/modules/notification/models/notification.model';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { NotificationService } from './notification.service';

@Resolver('Notification')
export class NotificationResolver {
  public constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Authorization()
  @Query(() => Number, { name: 'findNotificationsUnreadCount' })
  public async findNotificationsUnreadCount(@Authorized() user: User) {
    return this.notificationService.findUnreadCount(user);
  }

  @Authorization()
  @Query(() => [NotificationModel], { name: 'findNotificationsByUser' })
  public async findNotificationsByUser(@Authorized() user: User) {
    return this.notificationService.findNotificationsByUser(user);
  }

  @Authorization()
  @Mutation(() => ChangeNotificationsSettingsResponse, {
    name: 'changeNotificationsSettings',
  })
  public async changeNotificationsSettings(
    @Authorized() user: User,
    @Args('data') input: ChangeNotificationsSettingsInput,
  ) {
    return this.notificationService.changeSettings(user, input);
  }
}
