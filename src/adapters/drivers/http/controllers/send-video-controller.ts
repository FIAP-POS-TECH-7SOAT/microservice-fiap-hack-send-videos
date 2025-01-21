import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { LoggingInterceptor } from '../Interceptors/custom-logger-routes';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { UploadVideoUseCase } from '@core/modules/video/applications/use-cases/upload-video.use-case';
import { ListVideoByUserUseCase } from '@core/modules/video/applications/use-cases/list-video-by-user.use-case';
import { VideoUserMapping } from '../mapping/videos.mapping';
import { UploadPartVideoUseCase } from '@core/modules/video/applications/use-cases/upload-part-video.use-case';
import { CreateUploadPartProps } from './validations';
import { GetLastPartUploadVideoUseCase } from '@core/modules/video/applications/use-cases/get-last-part-upload-video.use-case';

@Controller('/videos')
@ApiTags('Videos')
@ApiBearerAuth()
@UseInterceptors(LoggingInterceptor)
export class SendVideosController {
  constructor(
    private readonly uploadVideoUseCase: UploadVideoUseCase,
    private readonly listVideoByUserUseCase: ListVideoByUserUseCase,
    private readonly uploadPartVideoUseCase: UploadPartVideoUseCase,
    private readonly getLastPartUploadVideoUseCase: GetLastPartUploadVideoUseCase,
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
  @Post('/send-part')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('video'))
  async sendPart(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateUploadPartProps,
    @Headers('user_id') user_id: string,
    @Headers('email') email: string,
    @Headers('phone') phone: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado!');
    }
    const { part_number, upload_id, total_parts, file_name } = body;
    file.originalname = file_name;
    const response = await this.uploadPartVideoUseCase.execute({
      file,
      user_id,
      email,
      phone,
      partNumber: part_number,
      uploadId: upload_id,
      totalParts: total_parts,
    });

    if (response.isLeft()) {
      throw new BadRequestException(
        `Erro ao enviar parte do video ${part_number}`,
      );
    }

    return {
      status: 200,
      upload_id: response.value.id,
      next_part: response.value.next_part,
    };
  }

  @Get('/last-part')
  async getLastPart(
    @Query('file_name') file_name: string,
    @Headers('user_id') user_id: string,
  ) {
    const response = await this.getLastPartUploadVideoUseCase.execute({
      file_name,
      user_id,
    });

    if (response.isLeft()) {
      throw new BadRequestException(`Erro ao buscar ultima parte enviada`);
    }

    return {
      status: 200,
      upload_id: response.value.upload_id,
      part_number: response.value.part_number,
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
