import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

import { EnvService } from '../infra/envs/env.service';

import {
  PublishMessagingProps,
  PublishMessagingProvider,
} from '@core/modules/video/applications/ports/providers/publish-messaging.provider';

@Injectable()
export class RabbitMqPublishMessagingProvider
  implements PublishMessagingProvider
{
  constructor(private readonly env: EnvService) {}
  async publish({ data, options }: PublishMessagingProps): Promise<void> {
    const connection = await amqp.connect(this.env.get('AMQP_URL'));
    const channel = await connection.createChannel();

    try {
      channel.publish(options.exchange, options.routingKey, Buffer.from(data));
    } catch (error) {
      console.error('Error publishing message to RabbitMQ:', error);
      throw new Error('Failed to publish message');
    }
  }
}
