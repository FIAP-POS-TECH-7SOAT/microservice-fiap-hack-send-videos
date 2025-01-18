import {
  PublishMessagingProps,
  PublishMessagingProvider,
} from '@core/modules/video/applications/ports/providers/publish-messaging.provider';

import { Injectable } from '@nestjs/common';

@Injectable()
export class FakePublishMessagingProvider implements PublishMessagingProvider {
  async publish(data: PublishMessagingProps): Promise<void> {
    console.log('message published:', data);
  }
}
