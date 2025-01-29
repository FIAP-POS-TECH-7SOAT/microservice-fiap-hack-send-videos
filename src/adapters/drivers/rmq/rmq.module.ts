import { Module } from '@nestjs/common';

import { EnvService } from '@adapters/drivens/infra/envs/env.service';
import { EnvModule } from '@adapters/drivens/infra/envs/env.module';
import * as amqp from 'amqplib';

import { UpdateVideoReadyUseCase } from '@core/modules/video/applications/use-cases/update-video-ready.use-case';
import { FileEventsConsumer } from './consumers/file-events.consumer';

@Module({
  imports: [EnvModule],
  providers: [UpdateVideoReadyUseCase],
  controllers: [FileEventsConsumer],
})
export class RMQModule {
  constructor(private readonly env: EnvService) {
    if (env.get('ENV') === 'test') return;
    this.setup();
  }
  private async setup() {
    try {
      const connection = await amqp.connect(this.env.get('AMQP_URL'));
      const channel = await connection.createChannel();
      const exchange = 'amq.direct';
      const queues = this.env.get('AMQP_QUEUES');
      const queuesKey = Object.keys(queues);

      const allPromises: any[] = [];

      queuesKey.forEach((queueKey) => {
        const queue = queues[queueKey].name;
        const routingKeys = queues[queueKey].routing_keys;
        // Declare a exchange do tipo `direct`
        allPromises.push(
          channel.assertExchange(exchange, 'direct', { durable: true }),
        );
        // Declare a fila
        allPromises.push(channel.assertQueue(queue, { durable: false }));
        // Bind da fila à exchange com a routing key
        routingKeys.forEach((routingKey: string) => {
          allPromises.push(channel.bindQueue(queue, exchange, routingKey));
        });
      });
      await Promise.all(allPromises);
      await channel.close();
      await connection.close();
    } catch (error) {
      console.error('Erro ao configurar o RabbitMQ:', error);
    }
  }
}
