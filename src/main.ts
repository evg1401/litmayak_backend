import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_GLOBAL_PREFIX } from 'configs/api.config';
import cookieParser from 'cookie-parser';
import { VersioningType } from '@nestjs/common';
import { cors } from 'configs/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(cors);
  app.use(json({ limit: '50mb' }));
  app.use(cookieParser());
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: API_GLOBAL_PREFIX,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('API litmayak web')
    .setDescription('Документация REST API')
    .setVersion('1.0.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/api-doc', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
