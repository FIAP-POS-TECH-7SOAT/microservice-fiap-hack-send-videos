import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { EnvService } from '@adapters/drivens/infra/envs/env.service';

import { MockJWTStrategy } from './fake-jwt.strategy';
import { FakeJwtAuthGuard } from './fake-auth-guard-provider';

@Module({
  providers: [
    EnvService,
    MockJWTStrategy,
    { provide: APP_GUARD, useClass: FakeJwtAuthGuard },
  ],
})
export class FakeAuthModule {}
