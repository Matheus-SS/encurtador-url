import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig, validateEnvVars } from './shared/config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  validateEnvVars();

  const log = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const AppConfig = configService.get<AppConfig>('app') as AppConfig;

  app.enableCors({
    origin: AppConfig.corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('/v1/api/');

  const config = new DocumentBuilder()
    .setTitle('Url shortener')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  if (AppConfig.NODE_ENV === 'development') {
    SwaggerModule.setup('/docs', app, documentFactory);
  }

  log.debug(JSON.stringify(AppConfig));

  await app.listen(AppConfig.port);
  log.log(`Server running on port ${AppConfig.port}`);
}
bootstrap();
