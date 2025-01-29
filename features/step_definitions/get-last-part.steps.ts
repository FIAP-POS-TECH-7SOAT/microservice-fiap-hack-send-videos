import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { TestingModule, Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import jwtDecoded from 'jsonwebtoken';
import request from 'supertest';
import { strict as assert } from 'assert';
import { AppModule } from '../../src/app.module';

import { CacheProvider } from '@core/modules/video/applications/ports/providers/cache.provider';
import { MockCacheProvider } from 'features/mocks/mock-cache-provider';

let app: INestApplication;
let cache: CacheProvider;
let response: request.Response;
let userId: string;
let fileName: string;

const jwt =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZmU0NWRjNC0zNWNkLTRlOWQtODJmNC1jNjBlMGU2Njk0MDEiLCJ1c2VyX2VtYWlsIjoidHNyb2NoYTkwMUBnbWFpbC5jb20iLCJwaG9uZSI6Iis1NTExOTQwMjYwMjgzIiwiZXhwIjoxNzM4NTk1NTU0LCJpYXQiOjE3Mzc5OTA3NTR9.la_morXAevvndgKfKRHc5tQdC6XSw_f2bI11HKn9DCNnxkP9pTcY7ET47ZPYzNKngp4muS5q47aFY6SV9iy1SrwYKBaXp_kQJR51omcY6_-jlZCsimkSqwbXGr6LK9SHCZQ-Z2waKs_KzyAbNeSvyk3iMD26DmeYKDUNWquN0yes7yphChiihw0xPtumobbQZAjacszBC3EA87svVZmRQvUb64KUTVTZtewpTY-46cEfR5IDTeQDBWxJ-vQ7ShmHTHmuuS0U9ATPe_h_5zk5jlFxuK0uM7m50fW3ZYo4njdmAueoMg1QvxLBlBH3DwYcyLAD7GSl_FzptH5NzAlmAw';

BeforeAll(async () => {
  const decoded = jwtDecoded.decode(jwt);
  userId = (decoded?.sub as string) || '';

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(CacheProvider)
    .useClass(MockCacheProvider)
    .compile();

  app = moduleFixture.createNestApplication();
  cache = moduleFixture.get<CacheProvider>(CacheProvider);
  await app.init();
});

AfterAll(async () => {
  await app.close();
});

Given('a video file {string} and user authenticated', async (file: string) => {
  fileName = file;

  const fileKey = `upload:${userId}_${fileName}`;

  // Simula a inserção de dados no Redis
  await cache.set(fileKey, {
    uploadId: 'upload12345',
    parts: [{ PartNumber: 1 }, { PartNumber: 2 }, { PartNumber: 3 }],
  });
});

When('I request the last part for the video file', async () => {
  response = await request(app.getHttpServer())
    .get('/videos/last-part')
    .query({ file_name: fileName })
    .set('Authorization', `Bearer ${jwt}`);
});

Then(
  'I should receive a {int} status code for last part',
  (statusCode: number) => {
    assert.equal(response.status, statusCode);
  },
);

Then('the response should include the upload ID and part number', () => {
  const body = response.body;

  assert.ok(body.upload_id, 'Expected upload_id to be present');
  assert.ok(body.part_number, 'Expected part_number to be present');
  assert.equal(body.upload_id, 'upload12345', 'Expected upload_id to match');
  assert.equal(body.part_number, 3, 'Expected part_number to match');
});
