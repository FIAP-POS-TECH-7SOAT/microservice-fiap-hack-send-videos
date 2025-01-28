import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { INestApplication } from '@nestjs/common';
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

let app: INestApplication;
let response: request.Response;
let token: string;
let fakefileName: string = '';

BeforeAll(async () => {
  await setupTestDatabase();
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

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
  token =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZmU0NWRjNC0zNWNkLTRlOWQtODJmNC1jNjBlMGU2Njk0MDEiLCJ1c2VyX2VtYWlsIjoidHNyb2NoYTkwMUBnbWFpbC5jb20iLCJwaG9uZSI6Iis1NTExOTQwMjYwMjgzIiwiZXhwIjoxNzM4NTk1NTU0LCJpYXQiOjE3Mzc5OTA3NTR9.la_morXAevvndgKfKRHc5tQdC6XSw_f2bI11HKn9DCNnxkP9pTcY7ET47ZPYzNKngp4muS5q47aFY6SV9iy1SrwYKBaXp_kQJR51omcY6_-jlZCsimkSqwbXGr6LK9SHCZQ-Z2waKs_KzyAbNeSvyk3iMD26DmeYKDUNWquN0yes7yphChiihw0xPtumobbQZAjacszBC3EA87svVZmRQvUb64KUTVTZtewpTY-46cEfR5IDTeQDBWxJ-vQ7ShmHTHmuuS0U9ATPe_h_5zk5jlFxuK0uM7m50fW3ZYo4njdmAueoMg1QvxLBlBH3DwYcyLAD7GSl_FzptH5NzAlmAw';
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
