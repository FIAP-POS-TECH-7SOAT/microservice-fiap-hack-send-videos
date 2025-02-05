import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { EnvService } from '@adapters/drivens/infra/envs/env.service';
import { patchNestJsSwagger } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const envService = app.get(EnvService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [envService.get('AMQP_URL')],
      queue: envService.get<any>('AMQP_QUEUES').FILE_QUEUE.name,
      noAck: false,
      queueOptions: {
        durable: false,
      },
    },
  });

  app.enableCors({ origin: '*' });
  patchNestJsSwagger();
  const config = new DocumentBuilder()
    .setTitle('Microservice Fiap Lanchonete Orders')
    .setDescription('Documentação das APIs dos Pedidos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {});

  await app.startAllMicroservices();
  await app.listen(envService.get('PORT'));
}
bootstrap();
