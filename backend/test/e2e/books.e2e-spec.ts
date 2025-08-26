import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import { unlinkSync, writeFileSync } from 'fs';

describe('Books E2E', () => {
  let app: INestApplication;
  let server: any;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Mirror main.ts: use same global prefix so /api/* routes resolve in tests
    app.setGlobalPrefix('api');
    await app.init();
    server = app.getHttpServer();

    // Login with test user
    const loginRes = await request(server)
      .post('/api/auth/login')
      .send({ email: 'test@cmpc.com', password: 'Test123!' });

    accessToken =
      loginRes.body.access_token || loginRes.body.data?.access_token;
    if (!accessToken) throw new Error('Access token missing in login response');
  }, 20000);

  afterAll(async () => {
    await app.close();
  });

  it('should create book and upload image', async () => {
    const suffix = Date.now();

    // create genre
    const genreRes = await request(server)
      .post('/api/genres')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `E2E Genre ${suffix}`, description: 'e2e' });

    // genre created

    const authorRes = await request(server)
      .post('/api/authors')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ first_name: `E2E ${suffix}`, last_name: 'Author' });
    // author created

    const publisherRes = await request(server)
      .post('/api/publishers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `E2E Publisher ${suffix}` });
    // publisher created

    const authorId = authorRes.body?.data?.id || authorRes.body?.id;
    const publisherId = publisherRes.body?.data?.id || publisherRes.body?.id;
    const genreId = genreRes.body?.data?.id || genreRes.body?.id;

    const bookRes = await request(server)
      .post('/api/books')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'E2E Book',
        price: 10,
        author_id: authorId,
        publisher_id: publisherId,
        genre_id: genreId,
      });

    // Diagnostic
    // eslint-disable-next-line no-console
    console.log(
      'BOOK CREATE RES:',
      bookRes.status,
      JSON.stringify(bookRes.body),
    );

    expect(bookRes.status).toBe(201);

    // create temporary image
    const tmpPath = '/tmp/e2e-image.png';
    writeFileSync(
      tmpPath,
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVQImWNgYGBgYAAAAAMAAP9B0lQAAAAASUVORK5CYII=',
        'base64',
      ),
    );

    const bookId = bookRes.body?.data?.id || bookRes.body?.id;

    const uploadRes = await request(server)
      .post(`/api/books/${bookId}/upload-image`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', tmpPath);

    unlinkSync(tmpPath);

    expect([200, 201]).toContain(uploadRes.status);
    const imageUrl =
      uploadRes.body?.data?.image_url || uploadRes.body?.image_url;
    expect(imageUrl).toBeTruthy();
  }, 30000);
});
