import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { TestingModule, Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import request from 'supertest';
import { strict as assert } from 'assert';
import { AppModule } from '../../src/app.module';
// import {
//   setupTestDatabase,
//   teardownTestDatabase,
// } from 'features/setup/prisma-test-setup';

import { FakeAuthModule } from 'test/mocks/mock-auth.module';
import { AuthModule } from '@adapters/drivens/infra/auth/auth.module';
import { FakeCacheProvider } from 'test/mocks/fake-cache-provider';
import { CacheProvider } from '@core/modules/video/applications/ports/providers/cache.provider';
import { UploadFileProvider } from '@core/modules/video/applications/ports/providers/upload-file';
import { FakeUploadFileProvider } from 'test/mocks/fake-upload-file-provider';

let app: INestApplication;

let response: request.Response;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let userId: string;
const jwt = '_token_';

BeforeAll(async () => {
  // await setupTestDatabase();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(UploadFileProvider)
    .useClass(FakeUploadFileProvider)
    .overrideProvider(CacheProvider)
    .useClass(FakeCacheProvider)
    .overrideModule(AuthModule)

    .useModule(FakeAuthModule)
    .compile();

  app = moduleRef.createNestApplication();

  await app.init();
});

AfterAll(async () => {
  await app.close();
  // await teardownTestDatabase();
});

Given('a user is authenticated', async () => {
  userId = '7fe45dc4-35cd-4e9d-82f4-c60e0e669401';
});

When('I request to generate an upload key', async () => {
  response = await request(app.getHttpServer())
    .post('/videos/generate-upload-key')
    .set('Authorization', `Bearer ${jwt}`)
    .send({
      file_name: 'test_video.mp4',
      total_parts: 3,
    });
});

Then(
  'I should receive a {int} status code when call to generate key',
  (statusCode: number) => {
    assert.equal(response.status, statusCode);
  },
);

Then('the response should include an upload ID', () => {
  assert.ok(response.body.upload_id, 'Expected upload_id to be present');
});
