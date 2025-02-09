import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import request from 'supertest';
import * as fs from 'fs';
import * as path from 'node:path';
import { AppModule } from '../../src/app.module';

import { strict as assert } from 'assert';
import {
  setupTestDatabase,
  teardownTestDatabase,
} from 'features/setup/prisma-test-setup';
import { UploadFileProvider } from '@core/modules/video/applications/ports/providers/upload-file';
import { FakeUploadFileProvider } from 'test/mocks/fake-upload-file-provider';
import { FakePublishMessagingProvider } from 'test/mocks/fake-publish-message-provider';
import { PublishMessagingProvider } from '@core/modules/video/applications/ports/providers/publish-messaging.provider';
import { JwtAuthGuard } from '@adapters/drivens/infra/auth/jwt-auth-guard';
import { FakeJwtAuthGuard } from 'test/mocks/fake-auth-guard-provider';
import { AuthModule } from '@adapters/drivens/infra/auth/auth.module';
import { FakeAuthModule } from 'test/mocks/mock-auth.module';

let app: INestApplication;
let response: request.Response;
let token: string;
let fakefileName: string = '';

BeforeAll(async () => {
  await setupTestDatabase();
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideModule(AuthModule)
    .useModule(FakeAuthModule)
    .overrideProvider(UploadFileProvider)
    .useClass(FakeUploadFileProvider)
    .overrideProvider(PublishMessagingProvider)
    .useClass(FakePublishMessagingProvider)
    .compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(); // If using global ValidationPipe
  await app.init();
});

AfterAll(async () => {
  await app.close();
  await teardownTestDatabase();
});

// Step to authenticate
Given('I am authenticated with a valid token', () => {
  token = '_token_';
});

// Step to have the video file
Given('I have a video file named {string}', (fileName: string) => {
  fakefileName = fileName;
  const mockFilePath = path.join(__dirname, '..', 'mocks', fileName);
  assert.ok(fs.existsSync(mockFilePath), `The file ${fileName} exist.`);
});

When(
  'I send a POST request to {string} with the video file',
  async (endpoint: string) => {
    const mockFilePath = path.join(__dirname, '..', 'mocks', fakefileName);
    const mockFile = fs.createReadStream(mockFilePath);

    response = await request(app.getHttpServer())
      .post(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .attach('video', mockFile)
      .timeout(10000);
  },
);

// Step to check status code
Then('I should receive a {int} status code', (statusCode: number) => {
  assert.equal(response.status, statusCode);
});

// Step to check message in the response
Then('the message should be {string}', (message: string) => {
  assert.equal(response.body.message, message);
});
