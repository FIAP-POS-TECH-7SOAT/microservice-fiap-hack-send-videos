export type PublishMessagingProps = {
  data: any;
  options: {
    exchange: string;
    routingKey: string;
  };
};
export abstract class PublishMessagingProvider {
  abstract publish(data: PublishMessagingProps): Promise<void>;
}
