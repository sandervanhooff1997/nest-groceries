import compression from 'compression';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { jwtVerify } from '@kinde-oss/kinde-node-express';
import helmet from 'helmet';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';

export function applyAppConfig(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const allowedOrigins = configService
    .getOrThrow<string>('ALLOWED_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const kindeIssuerUrl = configService.getOrThrow<string>('KINDE_ISSUER_URL');
  const kindeAudience =
    configService.get<string>('KINDE_AUDIENCE') ||
    configService.getOrThrow<string>('KINDE_CLIENT_ID');

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(compression());
  // Kinde middleware verifies bearer tokens and attaches the authenticated user to req.user.
  app.use(
    '/api/shopping-lists',
    jwtVerify(kindeIssuerUrl, { audience: kindeAudience }),
  );
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(configService));
  app.useGlobalInterceptors(new TransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest Groceries API')
    .setDescription('Shopping list management API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, swaggerDocument);
}
