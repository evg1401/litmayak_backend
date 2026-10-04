import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_GLOBAL_PREFIX } from 'configs/api.config';
import cookieParser from 'cookie-parser';
import { VersioningType } from '@nestjs/common';
import { cors } from 'configs/cors.config';
import { ConfigService } from '@nestjs/config';
import { getIntEnv } from 'configs/helpers';

// лимиты для body запроса
const BODY_LIMIT_DEFAULT = '100kb';
const BODY_LIMIT_LARGE = '50mb';
const LARGE_BODY_ROUTES = [
  `/${API_GLOBAL_PREFIX}1/profile/books/characters`,
  `/${API_GLOBAL_PREFIX}1/profile/magazine-articles`,
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(cors);
  app.use(LARGE_BODY_ROUTES, json({ limit: BODY_LIMIT_LARGE }));
  app.use(
    LARGE_BODY_ROUTES,
    urlencoded({ extended: true, limit: BODY_LIMIT_LARGE }),
  );
  app.use(json({ limit: BODY_LIMIT_DEFAULT }));
  app.use(cookieParser());
  app.use(urlencoded({ extended: true, limit: BODY_LIMIT_DEFAULT }));
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

  await app.listen(getIntEnv('PORT', app.get(ConfigService)));
}

bootstrap();
