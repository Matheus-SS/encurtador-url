import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig, DatabaseConfig, validateEnvVars } from './shared/config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  validateEnvVars();

  const log = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const AppConfig = configService.get<AppConfig>('app') as AppConfig;
  const DatabaseConfig = configService.get<DatabaseConfig>(
    'database',
  ) as DatabaseConfig;

  app.enableCors({
    origin: AppConfig.corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('/api/v1/');

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
  log.debug(JSON.stringify(DatabaseConfig));

  await app.listen(AppConfig.port);
  log.log(`Server running on port ${AppConfig.port}`);
}
bootstrap().catch(console.error);
