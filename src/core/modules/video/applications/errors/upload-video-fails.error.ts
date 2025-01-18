import { UseCaseError } from '@core/common/errors/use-case-error';

export class UploadVideoFailsError implements UseCaseError {
  public readonly message: string;

  constructor() {
    this.message = 'Upload video fails';
  }
}
