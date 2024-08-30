import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('images')
export class ImagesController {
  constructor() {}

  @Get(':imageName')
  async getImage(
    @Res() response: Response,
    @Param('imageName') imageName: string,
  ): Promise<void> {
    const imagePath = join(__dirname, '..', '..', 'uploads', imageName);
    return response.sendFile(imagePath);
  }
}
