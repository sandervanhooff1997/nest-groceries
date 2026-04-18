import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppConfig } from './apply-app-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  applyAppConfig(app);

  await app.listen(configService.getOrThrow<number>('PORT'));
}

void bootstrap();
