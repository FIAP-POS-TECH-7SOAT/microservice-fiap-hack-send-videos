export type PublishMessagingProps = {
  data: string;
  options: {
    exchange: string;
    routingKey: string;
  };
};
export abstract class PublishMessagingProvider {
  abstract publish(data: PublishMessagingProps): Promise<void>;
}
