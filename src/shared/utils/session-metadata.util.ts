import type { Request } from 'express';
import { lookup } from 'geoip-lite';
import * as countries from 'i18n-iso-countries';

import type { SessionMetadata } from '../types/session-metadata.types';

import { IS_DEV_ENV } from './is-dev.util';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import DeviceDetector = require('device-detector-js');
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-argument
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export const getSessionMetadata = (
  req: Request,
  userAgent: string,
): SessionMetadata => {
  const xForwardedFor =
    typeof req.headers['x-forwarded-for'] === 'string'
      ? req.headers['x-forwarded-for'].split(',')[0]
      : req.ip;

  const cfConnectingIp = Array.isArray(req.headers['cf-connecting-ip'])
    ? req.headers['cf-connecting-ip'][0]
    : req.headers['cf-connecting-ip'] || xForwardedFor;

  const ip = IS_DEV_ENV ? '173.166.164.121' : cfConnectingIp;

  const location = lookup(ip);
  const device = new DeviceDetector().parse(userAgent);

  return {
    location: {
      country: countries.getName(location.country, 'en') || 'Unknown',
      city: location.city,
      latitude: location.ll[0] || 0,
      longitude: location.ll[1] || 0,
    },
    device: {
      browser: device.client.name,
      os: device.os.name,
      type: device.device.type,
    },
    ip,
  };
};
