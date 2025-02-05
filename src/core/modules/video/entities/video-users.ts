import { Optional } from '@core/common/entities/optional';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { Entity } from '@core/common/entities/entity';

export type VideoUsersStatus = 'uploaded' | 'processing' | 'finished' | 'error';
export interface VideoUsersProps {
  title: string;
  user_id: string;
  url: string | null;
  status: VideoUsersStatus;
  email: string;
  phone: string;
  created_at: Date;
  updated_at: Date;
}

export class VideoUsers extends Entity<VideoUsersProps> {
  static create(
    props: Optional<VideoUsersProps, 'created_at' | 'status' | 'updated_at'>,
    id?: UniqueEntityID,
  ) {
    const videoUsers = new VideoUsers(
      {
        ...props,
        url: props.url ?? null,
        user_id: props.user_id,
        email: props.email,
        phone: props.phone,
        status: props.status ?? 'uploaded',
        created_at: props.created_at ?? new Date(),
        updated_at: props.created_at ?? new Date(),
      },
      id,
    );
    return videoUsers;
  }

  private touch() {
    this.props.updated_at = new Date();
  }
  public get url(): string | null {
    return this.props.url || null;
  }

  public set url(url: string) {
    this.props.url = url;
    this.touch();
  }

  public get title(): string {
    return this.props.title;
  }
  public get user_id(): string {
    return this.props.user_id;
  }
  public set user_id(user_id: string) {
    this.props.user_id = user_id;
    this.touch();
  }
  public get status(): VideoUsersStatus {
    return this.props.status;
  }
  public set status(status: VideoUsersStatus) {
    this.props.status = status;
    this.touch();
  }
  public get email(): string {
    return this.props.email;
  }
  public set email(email: string) {
    this.props.email = email;
    this.touch();
  }
  public get phone(): string {
    return this.props.phone;
  }
  public set phone(phone: string) {
    this.props.phone = phone;
    this.touch();
  }
  public get created_at(): Date {
    return this.props.created_at;
  }
  public get updated_at(): Date {
    return this.props.updated_at;
  }
}
