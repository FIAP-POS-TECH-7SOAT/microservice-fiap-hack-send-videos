import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as kleur from 'kleur';

import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '@adapters/drivens/infra/database/prisma/prisma.service';

import { AppModule } from '../../src/app.module';

describe(kleur.cyan('SendVideosController (e2e)'), () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe(kleur.yellow('Scenario: Uploading a video'), () => {
    it(kleur.green('should upload a video and return its URL'), async () => {
      const mockFilePath = path.join(__dirname, './mocks/mock-video.mp4');
      const mockFile = fs.createReadStream(mockFilePath);

      console.log(kleur.green('Given a valid video file'));

      const response = await request(app.getHttpServer())
        .post('/videos/send')
        .set('user_id', 'mock-user-id')
        .attach('video', mockFile, 'mock-video.mp4');

      console.log(kleur.cyan('When the video is uploaded'));

      expect(response.statusCode).toBe(201);
      console.log(kleur.magenta('Then it should return the file URL'));

      expect(response.body.upload).toHaveProperty('ok');
      expect(response.body.upload.ok).toBeTruthy();
    });

    it(kleur.red('should return 400 if no file is uploaded'), async () => {
      console.log(kleur.green('Given no file is attached'));

      const response = await request(app.getHttpServer())
        .post('/videos/send')
        .set('user_id', 'mock-user-id');

      console.log(kleur.cyan('When the upload is attempted'));

      expect(response.statusCode).toBe(400);
      console.log(kleur.magenta('Then it should return an error message'));
      expect(response.body).toHaveProperty(
        'message',
        'Nenhum arquivo enviado!',
      );
    });
  });

  describe(kleur.yellow('Scenario: Listing videos by user ID'), () => {
    it(kleur.green('should list videos for a valid user ID'), async () => {
      console.log(kleur.green('Given a user with videos in the database'));

      // Mock user ID and video data creation
      const userId = 'mock-user-id';
      await prisma.videoUsers.createMany({
        data: [{ id: 'video1', user_id: userId, url: 'Video 1' }],
      });

      console.log(kleur.cyan('When the videos are requested by user ID'));

      const response = await request(app.getHttpServer()).get(
        `/videos/${userId}`,
      );

      console.log(kleur.magenta('Then it should return the list of videos'));

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('videos');
      expect(response.body.videos).toHaveLength(2);
    });

    it(
      kleur.red('should return an error if the user has no videos'),
      async () => {
        console.log(kleur.green('Given a user ID with no associated videos'));

        const response = await request(app.getHttpServer()).get(
          '/videos/non-existing-user',
        );

        console.log(kleur.cyan('When the videos are requested'));

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('videos');
        expect(response.body.videos).toHaveLength(0);
      },
    );
  });
});
