import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from './images.controller';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('ImagesController', () => {
  let app: INestApplication;
  let imagesController: ImagesController;

  const imageName = 'test_image.png';
  const imagePath = path.join(__dirname, '..', '..', 'uploads', imageName);

  beforeAll(async () => {
    fs.writeFileSync(imagePath, 'fake image data');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    imagesController = module.get<ImagesController>(ImagesController);
  });

  it('should be defined', () => {
    expect(imagesController).toBeDefined();
  });

  it('should return an image file', async () => {
    return request(app.getHttpServer())
      .get(`/images/${imageName}`)
      .expect(200)
      .expect('Content-Type', /image\/png/);
  });

  afterAll(async () => {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await app.close();
  });
});
