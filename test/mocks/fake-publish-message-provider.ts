import { LoggerProvider } from '@core/common/ports/logger.provider';
import {
  PublishMessagingProps,
  PublishMessagingProvider,
} from '@core/modules/video/applications/ports/providers/publish-messaging.provider';

import { Injectable } from '@nestjs/common';

@Injectable()
export class FakePublishMessagingProvider implements PublishMessagingProvider {
  constructor(private readonly loggerProvider: LoggerProvider) {}
  async publish(data: PublishMessagingProps): Promise<void> {
    this.loggerProvider.info(
      `${FakePublishMessagingProvider.name} [publish]: data ${JSON.stringify(data)}`,
    );
  }
}
