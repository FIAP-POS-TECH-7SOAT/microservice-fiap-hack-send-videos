import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { LoggingInterceptor } from '../Interceptors/custom-logger-routes';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { UploadVideoUseCase } from '@core/modules/video/applications/use-cases/upload-video.use-case';
import { ListVideoByUserUseCase } from '@core/modules/video/applications/use-cases/list-video-by-user.use-case';
import { VideoUserMapping } from '../mapping/videos.mapping';

@Controller('/videos')
@ApiTags('Videos')
@ApiBearerAuth()
@UseInterceptors(LoggingInterceptor)
export class SendVideosController {
  constructor(
    private readonly uploadVideoUseCase: UploadVideoUseCase,
    private readonly listVideoByUserUseCase: ListVideoByUserUseCase,
  ) {}

  @Post('/send')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('video'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Headers('user_id') user_id: string,
    @Headers('email') email: string,
    @Headers('phone') phone: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado!');
    }

    this.uploadVideoUseCase.execute({
      file,
      user_id,
      email,
      phone,
    });

    return {
      status: 200,
      message: 'Video está sendo enviado e informaremos os proximos status!',
    };
  }

  @Get('/:id')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('video'))
  async listAllByUserId(@Param('id') id: string) {
    const result = await this.listVideoByUserUseCase.execute({
      id,
    });

    if (result.isLeft()) {
      throw new Error('');
    }
    return { videos: result.value.videos.map(VideoUserMapping.toView) };
  }
}
