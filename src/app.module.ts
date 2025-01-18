import { Module } from '@nestjs/common';

import { HTTPModule } from '@adapters/drivers/http/http.module';

import { ConfigModule } from '@nestjs/config';

import { schemaEnv } from '@adapters/drivens/infra/envs/env';
import { EnvModule } from '@adapters/drivens/infra/envs/env.module';
import DatabaseModule from '@adapters/drivens/infra/database/prisma/database.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProviderModule } from '@adapters/drivens/providers/provider.module';
import { RMQModule } from '@adapters/drivers/rmq/rmq.module';

@Module({
  imports: [
    EnvModule,
    HTTPModule,

    ConfigModule.forRoot({
      validate: (env) => {
        env.AMQP_QUEUES = JSON.parse(env.AMQP_QUEUES);
        return schemaEnv.parse(env);
      },
      isGlobal: true,
    }),

    {
      module: DatabaseModule,
      global: true,
    },
    {
      module: ProviderModule,
      global: true,
    },
    RMQModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [],
})
export class AppModule {}
