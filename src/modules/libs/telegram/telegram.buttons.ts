import { Markup } from 'telegraf';

export const BUTTONS = {
  authSuccess: Markup.inlineKeyboard([
    [
      Markup.button.callback('My followings', 'follows'),
      Markup.button.callback('View profile', 'me'),
    ],
    [Markup.button.url('On site', 'https://lumenway.com')],
  ]),
  profile: Markup.inlineKeyboard([
    Markup.button.url(
      'Account settings',
      'https://lumenway.com/dashboard/settings',
    ),
  ]),
};
