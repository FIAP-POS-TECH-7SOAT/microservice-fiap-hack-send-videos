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

import { FakeAuthModule } from 'features/mocks/mock-auth.module';
import { AuthModule } from '@adapters/drivens/infra/auth/auth.module';
import { FakeCacheProvider } from 'features/mocks/fake-cache-provider';
import { CacheProvider } from '@core/modules/video/applications/ports/providers/cache.provider';

import { FakeUploadFileProvider } from 'features/mocks/fake-upload-file-provider';
import { UploadFileProvider } from '@core/modules/video/applications/ports/providers/upload-file';

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

Given('a user is authenticated to get missing parts', async () => {
  userId = '7fe45dc4-35cd-4e9d-82f4-c60e0e669401';
});

When('I request to get missing parts for the video', async () => {
  response = await request(app.getHttpServer())
    .get('/videos/missing-parts')
    .set('Authorization', `Bearer ${jwt}`)
    .query({
      file_name: 'test_video.mp4',
    });
});

Then(
  'I should receive a {int} status code when requesting missing parts',
  (statusCode: number) => {
    assert.equal(response.status, statusCode);
  },
);

Then('the response should include missing parts information', () => {
  // assert.ok(response.body.upload_id, 'Expected upload_id to be present');
  assert.ok(
    Array.isArray(response.body.missing_parts),
    'Expected missing_parts to be an array',
  );
});
