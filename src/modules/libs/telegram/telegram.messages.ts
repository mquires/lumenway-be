import type { User } from '@/prisma/generated';
import { SessionMetadata } from '@/src/shared/types/session-metadata.types';

export const MESSAGES = {
  welcome: `<b>Welcome to Lumenway Bot!</b>\n\n To receive notifications from our platform, we suggest you link your Telegram account to Lumenway.\n\n Click the button below and go to the <b>Notification section</b> to complete the setup.`,
  authSuccess:
    'You have successfully logged in and linked your Telegram account to Lumenway!\n\n',
  invalidToken: 'Invalid or expired token.',
  notFoundToken: 'Token not found.',
  profile: (user: User, followersCount: number) =>
    `<b>👤 User Profile:</b>\n\n` +
    `👤 Username: <b>${user.username}</b>\n` +
    `📧 Email: <b>${user.email}</b>\n` +
    `👥 Followers Count: <b>${followersCount}</b>\n` +
    `📝 About Me: <b>${user.bio || 'Not Specified'}</b>\n\n` +
    `🔧 Click the button below to go to your profile settings.`,
  follows: (user: User) =>
    `📺 <a href="https://lumenway.com/${user.username}">${user.username}</a>`,
  resetPassword: (token: string, metadata: SessionMetadata) =>
    `<b>🔒 Reset Password</b>\n\n` +
    `You have requested a password reset for your account on the <b>Lumenway</b> platform.\n\n` +
    `To create a new password, please follow this link:\n\n` +
    `<b><a href="https://lumenway.com/account/recovery/${token}">Reset Password</a></b>\n\n` +
    `📅 <b>Request Date:</b> ${new Date().toLocaleDateString()} to ${new Date().toLocaleTimeString()}\n\n` +
    `🖥️ <b>Request Information:</b>\n\n` +
    `🌍 <b>Location:</b> ${metadata.location.country}, ${metadata.location.city}\n` +
    `📱 <b>Operating System:</b> ${metadata.device.os}\n` +
    `🌐 <b>Browser:</b> ${metadata.device.browser}\n` +
    `💻 <b>IP Address:</b> ${metadata.ip}\n\n` +
    `If you did not make this request, simply ignore this message.\n\n` +
    `Thank you for using <b>Lumenway</b>! 🚀`,
  deactivate: (token: string, metadata: SessionMetadata) =>
    `<b>⚠️ Account deactivation request</b>\n\n` +
    `You have initiated the process of deactivating your account on the <b>Lumenway</b> platform.\n\n` +
    `To complete the operation, please confirm your request by entering the following confirmation code:\n\n` +
    `<b>Confirmation code: ${token}</b>\n\n` +
    `📅 <b>Request date:</b> ${new Date().toLocaleDateString()} to ${new Date().toLocaleTimeString()}\n\n` +
    `🖥️ <b>Request details:</b>\n\n` +
    `• 🌍 <b>Location:</b> ${metadata.location.country}, ${metadata.location.city}\n` +
    `• 📱 <b>Operating System:</b> ${metadata.device.os}\n` +
    `• 🌐 <b>Browser:</b> ${metadata.device.browser}\n` +
    `• 💻 <b>IP Address:</b> ${metadata.ip}\n\n` +
    `<b>What happens after deactivation?</b>\n\n` +
    `1. You will be automatically logged out and will lose access to your account.\n` +
    `2. If you do not cancel the deactivation within 7 days, your account will be <b>permanently deleted</b> along with all your information, data, and subscriptions.\n\n` +
    `<b>⏳ Please note:</b> If you change your mind within 7 days, you can contact our support to restore access to your account before it is completely deleted.\n\n` +
    `Once your account is deleted, it will be impossible to restore it and all data will be lost without the possibility of recovery.\n\n` +
    `If you change your mind, simply ignore this message. Your account will remain active.\n\n` +
    `Thank you for using <b>Lumenway</b>! We are always happy to see you on our platform and hope that you will stay with us. 🚀\n\n` +
    `Sincerely,\n` +
    `Lumenway Team`,
  accountDeleted:
    `<b>⚠️ Your account has been completely deleted.</b>\n\n` +
    `Your account has been completely erased from the Lumenway database. All your data and information has been permanently deleted. ❌\n\n` +
    `🔒 You will no longer receive notifications in Telegram and by email.\n\n` +
    `If you want to return to the platform, you can register using the following link:\n` +
    `<b><a href="https://lumenway.com/account/create">Register on Lumenway</a></b>\n\n` +
    `Thank you for being with us! We will always be glad to see you on the platform. 🚀\n\n` +
    `Sincerely,\n` +
    `Lumenway Team`,
  streamStart: (channel: User) =>
    `<b>📡 The ${channel.displayName} channel has started broadcasting!</b>\n\n` +
    `Watch here: <a href="https://lumenway.com/${channel.username}">Go to broadcast</a>`,
  newFollowing: (follower: User, followersCount: number) =>
    `<b>You have a new follower!</b>\n\nThis is user <a href="https://lumenway.com/${follower.username}">${follower.displayName}</a>\n\nThe total number of followers on your channel: ${followersCount}`,
};
