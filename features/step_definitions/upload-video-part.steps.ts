import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { TestingModule, Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import request from 'supertest';
import { strict as assert } from 'assert';
import { AppModule } from '../../src/app.module';
import {
  setupTestDatabase,
  teardownTestDatabase,
} from 'features/setup/prisma-test-setup';
import { UploadFileProvider } from '@core/modules/video/applications/ports/providers/upload-file';
import { FakeUploadFileProvider } from 'test/mocks/fake-upload-file-provider';
import { PublishMessagingProvider } from '@core/modules/video/applications/ports/providers/publish-messaging.provider';
import { FakePublishMessagingProvider } from 'test/mocks/fake-publish-message-provider';
import { JwtAuthGuard } from '@adapters/drivens/infra/auth/jwt-auth-guard';
import { FakeJwtAuthGuard } from 'test/mocks/fake-auth-guard-provider';
import { AuthModule } from '@adapters/drivens/infra/auth/auth.module';
import { FakeAuthModule } from 'test/mocks/mock-auth.module';

let app: INestApplication;
let response: request.Response;
let token: string;
let videoFile: Express.Multer.File;
let requestBody: any;

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
  await app.init();

  // Mock authentication token
  token = '_token_';
});

AfterAll(async () => {
  await teardownTestDatabase();
  await app.close();
});

Given(
  'I am authenticated with a valid token to call a video part enpoint',
  () => {
    assert.ok(token, 'Token should be defined');
  },
);

Given('I have a video file part named {string}', (fileName: string) => {
  videoFile = {
    originalname: fileName,
    buffer: Buffer.from('fake video data'),
    mimetype: 'video/mp4',
  } as Express.Multer.File;

  assert.ok(videoFile, 'Video file should be defined');
});

Given('the request body contains:', (table) => {
  requestBody = table.rowsHash();
  requestBody.part_number = parseInt(requestBody.part_number);
  requestBody.total_parts = parseInt(requestBody.total_parts);

  assert.ok(requestBody.upload_id, 'Upload ID should be defined');
  assert.ok(requestBody.part_number, 'Part number should be defined');
  assert.ok(requestBody.total_parts, 'Total parts should be defined');
});

When(
  'I send a POST request to {string} with the video part',
  async (endpoint: string) => {
    response = await request(app.getHttpServer())
      .post(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .field(requestBody)
      .attach('video', videoFile.buffer, videoFile.originalname);
  },
);

Then(
  'I should receive a {int} status code from video part endpoint',
  (statusCode: number) => {
    assert.equal(response.status, statusCode);
  },
);

Then('the response from video part endpoint should include:', (table) => {
  const expected = table.rowsHash();

  assert.equal(response.body.upload_id, expected.upload_id);
});
