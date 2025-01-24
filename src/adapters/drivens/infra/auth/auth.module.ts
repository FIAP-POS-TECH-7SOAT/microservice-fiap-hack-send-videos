import { Module } from '@nestjs/common';

import { JWTStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth-guard';
import { APP_GUARD } from '@nestjs/core';
import { EnvService } from '../envs/env.service';

@Module({
  providers: [
    EnvService,
    JWTStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
