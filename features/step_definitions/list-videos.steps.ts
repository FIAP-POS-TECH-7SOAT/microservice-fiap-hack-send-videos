import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { TestingModule, Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import jwtDecoded from 'jsonwebtoken';
import request from 'supertest';
import { strict as assert } from 'assert';
import { AppModule } from '../../src/app.module';
import {
  setupTestDatabase,
  teardownTestDatabase,
} from 'features/setup/prisma-test-setup';
import { PrismaService } from '@adapters/drivens/infra/database/prisma/prisma.service';

let app: INestApplication;
let prisma: PrismaClient;
let response: request.Response;
let userId: string;
const jwt =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZmU0NWRjNC0zNWNkLTRlOWQtODJmNC1jNjBlMGU2Njk0MDEiLCJ1c2VyX2VtYWlsIjoidHNyb2NoYTkwMUBnbWFpbC5jb20iLCJwaG9uZSI6Iis1NTExOTQwMjYwMjgzIiwiZXhwIjoxNzM4NTk1NTU0LCJpYXQiOjE3Mzc5OTA3NTR9.la_morXAevvndgKfKRHc5tQdC6XSw_f2bI11HKn9DCNnxkP9pTcY7ET47ZPYzNKngp4muS5q47aFY6SV9iy1SrwYKBaXp_kQJR51omcY6_-jlZCsimkSqwbXGr6LK9SHCZQ-Z2waKs_KzyAbNeSvyk3iMD26DmeYKDUNWquN0yes7yphChiihw0xPtumobbQZAjacszBC3EA87svVZmRQvUb64KUTVTZtewpTY-46cEfR5IDTeQDBWxJ-vQ7ShmHTHmuuS0U9ATPe_h_5zk5jlFxuK0uM7m50fW3ZYo4njdmAueoMg1QvxLBlBH3DwYcyLAD7GSl_FzptH5NzAlmAw';

BeforeAll(async () => {
  await setupTestDatabase();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  prisma = moduleRef.get(PrismaService);
  await app.init();
});

AfterAll(async () => {
  await app.close();
  await teardownTestDatabase();
});

// Implementação do step 'Given'
Given('a user authenticated', async () => {
  const decoded = jwtDecoded.decode(jwt);
  userId = (decoded?.sub as string) || '';

  // Cria os registros no banco de dados com os vídeos para esse usuário
  await prisma.videoUsers.createMany({
    data: [
      {
        id: 'video1',
        user_id: userId,
        url: 'https://example.com/video1',
        email: 'fake@mail.com',
        phone: '551194023025',
        status: 'uploaded',
      },
      {
        id: 'video2', // Gera um ID único para o segundo vídeo
        user_id: userId,
        url: 'https://example.com/video2',
        email: 'fake@mail.com',
        phone: '551194023025',
        status: 'uploaded',
      },
    ],
  });
});

When('I request the videos for the user', async () => {
  const jwt =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZmU0NWRjNC0zNWNkLTRlOWQtODJmNC1jNjBlMGU2Njk0MDEiLCJ1c2VyX2VtYWlsIjoidHNyb2NoYTkwMUBnbWFpbC5jb20iLCJwaG9uZSI6Iis1NTExOTQwMjYwMjgzIiwiZXhwIjoxNzM4NTk1NTU0LCJpYXQiOjE3Mzc5OTA3NTR9.la_morXAevvndgKfKRHc5tQdC6XSw_f2bI11HKn9DCNnxkP9pTcY7ET47ZPYzNKngp4muS5q47aFY6SV9iy1SrwYKBaXp_kQJR51omcY6_-jlZCsimkSqwbXGr6LK9SHCZQ-Z2waKs_KzyAbNeSvyk3iMD26DmeYKDUNWquN0yes7yphChiihw0xPtumobbQZAjacszBC3EA87svVZmRQvUb64KUTVTZtewpTY-46cEfR5IDTeQDBWxJ-vQ7ShmHTHmuuS0U9ATPe_h_5zk5jlFxuK0uM7m50fW3ZYo4njdmAueoMg1QvxLBlBH3DwYcyLAD7GSl_FzptH5NzAlmAw';
  response = await request(app.getHttpServer())
    .get(`/videos`)
    .set('Authorization', `Bearer ${jwt}`); // Certifique-se de passar um JWT válido
});

Then(
  'I should receive a {int} status code for videos list',
  (statusCode: number) => {
    assert.equal(response.status, statusCode);
  },
);

Then('the response should include a list of videos', () => {
  const body = response.body;

  assert.ok(Array.isArray(body.videos), 'Expected videos to be an array');
  assert.equal(body.videos.length, 2, 'Expected 2 videos in the response');

  const videoIds = body.videos.map((video: any) => video.id);
  assert.deepEqual(
    videoIds,
    ['video1', 'video2'],
    'Expected video IDs to match',
  );
});
