import compression from 'compression';
import type { NextFunction, Request, Response } from 'express';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { jwtVerify } from '@kinde-oss/kinde-node-express';
import helmet from 'helmet';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { User } from '@shared/entities/user.entity';

// Paths (relative to the global '/api' prefix) that should skip Kinde JWT verification.
// Keep this in sync with controllers marked with @Public().
const PUBLIC_API_PATH_REGEX = /^\/(health|docs)(\/|$)/;

// Kinde's jwtVerify sets req.user = { id: sub }. The rest of the app wants a
// richer shape (the User entity) so it can log emails, construct audit trails,
// etc. We decode the already-verified token here — Kinde has just verified the
// signature, so a trust-but-parse is safe — and hydrate req.user accordingly.
function decodeVerifiedJwtPayload(
  token: string,
): Record<string, unknown> | null {
  const [, payload] = token.split('.');
  if (!payload) return null;
  try {
    const normalised = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(normalised, 'base64').toString('utf8');
    const parsed: unknown = JSON.parse(decoded);
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function hydrateUserFromKindeToken(
  req: Request & { user?: unknown },
  token: string,
): void {
  const payload = decodeVerifiedJwtPayload(token);
  // `sub` is the Kinde user id and is the only field we absolutely require.
  // If the tenant has added an email claim to access tokens it flows through.
  const sub = typeof payload?.sub === 'string' ? payload.sub : null;
  if (!sub) return;

  const email = typeof payload?.email === 'string' ? payload.email : undefined;
  const givenName =
    typeof payload?.given_name === 'string' ? payload.given_name : undefined;
  const familyName =
    typeof payload?.family_name === 'string' ? payload.family_name : undefined;

  req.user = new User({
    _id: sub,
    email,
    firstName: givenName,
    lastName: familyName,
  });
}

export function applyAppConfig(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const allowedOrigins = configService
    .getOrThrow<string>('ALLOWED_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const kindeIssuerUrl = configService.getOrThrow<string>('KINDE_ISSUER_URL');
  const kindeAudience =
    configService.get<string>('KINDE_AUDIENCE') ??
    configService.get<string>('KINDE_CLIENT_ID');

  if (!kindeAudience) {
    // The env validation schema enforces this at boot via `.or(...)`, but we
    // guard here too so TypeScript narrows the type for `jwtVerify`.
    throw new Error(
      'Either KINDE_AUDIENCE or KINDE_CLIENT_ID must be set so Kinde tokens can be validated against this API.',
    );
  }

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(compression());

  // CORS must be registered BEFORE the Kinde middleware. Otherwise the
  // browser's preflight OPTIONS request (which never carries a bearer token)
  // is rejected by Kinde with 401 before CORS headers are attached, and the
  // browser reports a CORS error instead of a clear auth failure.
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Kinde middleware verifies bearer tokens against the tenant's JWKS and attaches
  // the authenticated user to req.user. Applied to every /api route except those
  // explicitly marked public (health checks, swagger docs) and preflight OPTIONS.
  const kindeJwtVerify = jwtVerify(kindeIssuerUrl, {
    audience: kindeAudience,
  });
  app.use('/api', (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'OPTIONS' || PUBLIC_API_PATH_REGEX.test(req.path)) {
      next();
      return;
    }

    // Short-circuit before the JWKS roundtrip for the common
    // no-credentials case. Kinde's middleware would also reject these, but
    // it does so after loading verification keys. A fast local 403 is
    // cheaper, clearer in logs, and avoids hammering Kinde on anonymous
    // traffic (bots, misconfigured clients, a frontend that hasn't
    // attached the bearer yet, etc.).
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      res.status(403).json({
        statusCode: 403,
        message: 'Missing or malformed Authorization header',
        error: 'Forbidden',
      });
      return;
    }

    const bearer = authHeader.slice('Bearer '.length).trim();

    // After Kinde verifies, replace its bare {id: sub} with a fully-shaped
    // User entity so auditing/query handlers can read _id, email, etc.
    void kindeJwtVerify(req, res, (err?: unknown) => {
      if (err) {
        next(err);
        return;
      }
      hydrateUserFromKindeToken(req, bearer);
      next();
    });
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
