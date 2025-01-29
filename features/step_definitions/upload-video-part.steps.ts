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
import { FakeUploadFileProvider } from 'features/mocks/fake-upload-file-provider';
import { PublishMessagingProvider } from '@core/modules/video/applications/ports/providers/publish-messaging.provider';
import { FakePublishMessagingProvider } from 'features/mocks/fake-publish-message-provider';

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
    .overrideProvider(UploadFileProvider)
    .useClass(FakeUploadFileProvider)
    .overrideProvider(PublishMessagingProvider)
    .useClass(FakePublishMessagingProvider)
    .compile();

  app = moduleRef.createNestApplication();
  await app.init();

  // Mock authentication token
  token =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZmU0NWRjNC0zNWNkLTRlOWQtODJmNC1jNjBlMGU2Njk0MDEiLCJ1c2VyX2VtYWlsIjoidHNyb2NoYTkwMUBnbWFpbC5jb20iLCJwaG9uZSI6Iis1NTExOTQwMjYwMjgzIiwiZXhwIjoxNzM4NTk1NTU0LCJpYXQiOjE3Mzc5OTA3NTR9.la_morXAevvndgKfKRHc5tQdC6XSw_f2bI11HKn9DCNnxkP9pTcY7ET47ZPYzNKngp4muS5q47aFY6SV9iy1SrwYKBaXp_kQJR51omcY6_-jlZCsimkSqwbXGr6LK9SHCZQ-Z2waKs_KzyAbNeSvyk3iMD26DmeYKDUNWquN0yes7yphChiihw0xPtumobbQZAjacszBC3EA87svVZmRQvUb64KUTVTZtewpTY-46cEfR5IDTeQDBWxJ-vQ7ShmHTHmuuS0U9ATPe_h_5zk5jlFxuK0uM7m50fW3ZYo4njdmAueoMg1QvxLBlBH3DwYcyLAD7GSl_FzptH5NzAlmAw';
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
  assert.equal(response.body.next_part, parseInt(expected.next_part));
});
