import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MeasuresModule } from './measures/measures.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'shopper_api',
      synchronize: true,
      logging: false,
      autoLoadEntities: true,
    }),
    MeasuresModule,
    ImagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
