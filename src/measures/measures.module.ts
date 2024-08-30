import { Module } from '@nestjs/common';
import { MeasuresController } from './measures.controller';
import { MeasuresService } from './measures.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasureEntity } from './measure.entity';
import { Base64ImageValidator } from './validators/base64-image.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([MeasureEntity]),
  ],
  controllers: [MeasuresController],
  providers: [MeasuresService, Base64ImageValidator]
})
export class MeasuresModule {}
