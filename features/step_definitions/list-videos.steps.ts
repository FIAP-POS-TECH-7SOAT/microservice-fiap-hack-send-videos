import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { TestingModule, Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import request from 'supertest';
import { strict as assert } from 'assert';
import { AppModule } from '../../src/app.module';
import {
  setupTestDatabase,
  teardownTestDatabase,
} from 'features/setup/prisma-test-setup';
import { PrismaService } from '@adapters/drivens/infra/database/prisma/prisma.service';

import { FakeAuthModule } from 'features/mocks/mock-auth.module';
import { AuthModule } from '@adapters/drivens/infra/auth/auth.module';

let app: INestApplication;
let prisma: PrismaClient;
let response: request.Response;
let userId: string;

BeforeAll(async () => {
  await setupTestDatabase();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })

    .overrideModule(AuthModule)
    .useModule(FakeAuthModule)
    .compile();

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
  userId = '7fe45dc4-35cd-4e9d-82f4-c60e0e669401';

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
        title: 'my title',
      },
      {
        id: 'video2', // Gera um ID único para o segundo vídeo
        user_id: userId,
        url: 'https://example.com/video2',
        email: 'fake@mail.com',
        phone: '551194023025',
        status: 'uploaded',
        title: 'my title',
      },
    ],
  });
});

When('I request the videos for the user', async () => {
  const jwt = '_token_';
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
