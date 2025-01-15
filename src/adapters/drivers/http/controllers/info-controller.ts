import { Controller, Get, HttpCode, UseInterceptors } from '@nestjs/common';

import * as pkg from '../../../../../package.json';

import { LoggingInterceptor } from '../Interceptors/custom-logger-routes';

import { ApiTags } from '@nestjs/swagger';

@Controller('/info')
@ApiTags('Info')
@UseInterceptors(LoggingInterceptor)
export class InfoController {
  constructor() {}

  @Get('/')
  @HttpCode(200)
  async info() {
    return {
      version: pkg.version,
      service: pkg.name,
    };
  }
}
