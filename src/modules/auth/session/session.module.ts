import { Module } from '@nestjs/common';

import { RedisModule } from '@/src/app/redis/redis.module';

import { SessionResolver } from './session.resolver';
import { SessionService } from './session.service';

@Module({
  imports: [RedisModule],
  providers: [SessionResolver, SessionService],
})
export class SessionModule {}
