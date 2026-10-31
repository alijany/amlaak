import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { CodedExceptionFilter } from './libs/error/error.filter.coded';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // Enable CORS
  app.enableCors();

  // Error bodies carry a `code` the client translates; see
  // `libs/error/error.exception.coded.ts` for the contract.
  app.useGlobalFilters(new CodedExceptionFilter());

  // Seeding of production personas now happens in PersonaService's lifecycle hook

  await app.listen(4000);
  return app;
}

bootstrap();
