import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
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
import { TokenPayload } from '@adapters/drivens/infra/auth/jwt.strategy';
import { CurrentUser } from '@adapters/drivens/infra/auth/current-user-decorator';

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
    @CurrentUser() user: TokenPayload,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado!');
    }

    await this.uploadVideoUseCase.execute({
      file,
      user_id: user.sub,
      email: user.user_email,
      phone: user.phone.replace(/[^0-9]/g, ''),
    });

    return {
      status: 201,
      message:
        'The video is being uploaded and we will inform you of the next statuses!',
    };
  }
  @Post('/send-part')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('video'))
  async sendPart(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateUploadPartProps,
    @CurrentUser() user: TokenPayload,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado!');
    }
    const { part_number, upload_id, total_parts, file_name } = body;
    file.originalname = file_name;
    const response = await this.uploadPartVideoUseCase.execute({
      file,
      user_id: user.sub,
      email: user.user_email,
      phone: user.phone.replace(/[^0-9]/g, ''),
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
    @CurrentUser() user: TokenPayload,
  ) {
    const response = await this.getLastPartUploadVideoUseCase.execute({
      file_name,
      user_id: user.sub,
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

  @Get('/')
  @HttpCode(200)
  async listAllByUserId(@CurrentUser() user: TokenPayload) {
    const result = await this.listVideoByUserUseCase.execute({
      id: user.sub,
    });

    if (result.isLeft()) {
      throw new Error('');
    }
    return { videos: result.value.videos.map(VideoUserMapping.toView) };
  }
}
