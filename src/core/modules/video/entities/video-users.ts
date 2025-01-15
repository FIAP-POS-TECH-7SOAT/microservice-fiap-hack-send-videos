import { Optional } from '@core/common/entities/optional';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { Entity } from '@core/common/entities/entity';

export interface VideoUsersProps {
  user_id: string;
  url: string;
  created_at?: Date;
}

export class VideoUsers extends Entity<VideoUsersProps> {
  static create(
    props: Optional<VideoUsersProps, 'created_at'>,
    id?: UniqueEntityID,
  ) {
    const videoUsers = new VideoUsers(
      {
        ...props,
        url: props.url,
        user_id: props.user_id,
        created_at: props.created_at ?? new Date(),
      },
      id,
    );
    return videoUsers;
  }
  public get url() {
    return this.props.url;
  }
  public set url(url: string) {
    this.props.url = url;
  }

  public get user_id(): string {
    return this.props.user_id;
  }
  public set user_id(user_id: string) {
    this.props.user_id = user_id;
  }
  public get created_at(): Date {
    return this.props.created_at ?? new Date();
  }
}
