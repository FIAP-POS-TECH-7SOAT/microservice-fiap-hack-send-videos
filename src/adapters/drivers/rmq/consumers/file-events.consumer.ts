import { Controller } from '@nestjs/common';
import { Payload, Ctx, RmqContext, EventPattern } from '@nestjs/microservices';
import { FileProcessedDTO } from './dtos/file-processed.dto';

import { UpdateVideoReadyUseCase } from '@core/modules/video/applications/use-cases/update-video-ready.use-case';
import { LoggerProvider } from '@core/common/ports/logger.provider';

@Controller()
export class FileEventsConsumer {
  constructor(
    private readonly updateVideoReadyUseCase: UpdateVideoReadyUseCase,
    private readonly logger: LoggerProvider,
  ) {}

  @EventPattern('file:processed')
  async handelFileProcessed(
    @Payload() { id, url, status }: FileProcessedDTO,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      const result = await this.updateVideoReadyUseCase.execute({
        id,
        url,
        status,
      });

      if (result.isLeft()) {
        throw result.value;
      }
      const { video } = result.value;
      channel.publish(
        'amq.direct',
        'notification:sms',
        Buffer.from(
          JSON.stringify({
            message: 'Seu video está pronto',
            phone: video.phone,
          }),
        ),
      );

      channel.publish(
        'amq.direct',
        'notification:email',
        Buffer.from(
          JSON.stringify({
            html: '<p>Seu video está pronto</p>',
            subject: 'Processamento de video finalizado',
            text: 'Seu video está pronto',
            to: video.email,
          }),
        ),
      );

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Erro ${error}`);

      throw error;

      // TODO: Deve lancar um erro apropriado
    }
  }

  @EventPattern('file:processing')
  async handelFileUploaded(
    @Payload() { id, url, status }: FileProcessedDTO,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      const result = await this.updateVideoReadyUseCase.execute({
        id,
        url,
        status,
      });

      if (result.isLeft()) {
        throw result.value;
      }
      const { video } = result.value;
      channel.publish(
        'amq.direct',
        'notification:sms',
        Buffer.from(
          JSON.stringify({
            message: 'Seu video comecou a ser processado',
            phone: video.phone,
          }),
        ),
      );

      channel.publish(
        'amq.direct',
        'notification:email',
        Buffer.from(
          JSON.stringify({
            html: '<p>Seu video comecou a ser processado</p>',
            subject: 'Processamento de video iniciado',
            text: 'Seu video comecou a ser processado',
            to: video.email,
          }),
        ),
      );

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Erro ${error}`);

      throw error;

      // TODO: Deve lancar um erro apropriado
    }
  }
}
