import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import {
  Test,
  type TestingModule,
  type TestingModuleBuilder,
} from '@nestjs/testing';
import { ConnectionStates, type Connection } from 'mongoose';
import { User } from '../../src/shared/entities/user.entity';
import { applyAppConfig } from '../../src/apply-app-config';
import { E2eAppModule } from './e2e-app.module';
import {
  buildE2eMongoUri,
  createE2eConfigService,
  resolveE2eDatabaseName,
} from './e2e-database';

export interface CreateE2eAppOptions {
  testFilePath: string;
  overrideModule?: (
    builder: TestingModuleBuilder,
  ) => TestingModuleBuilder | void;
}

export interface E2eAppContext {
  app: INestApplication;
  moduleRef: TestingModule;
  connection: Connection;
  databaseName: string;
  close(): Promise<void>;
}

export async function createE2eApp(
  options: CreateE2eAppOptions,
): Promise<E2eAppContext> {
  const databaseName = resolveE2eDatabaseName(options.testFilePath);
  const mongoUri = buildE2eMongoUri(databaseName);
  const configService = createE2eConfigService(mongoUri);

  let testingModuleBuilder = Test.createTestingModule({
    imports: [E2eAppModule],
  })
    .overrideProvider(ConfigService)
    .useValue(configService);

  const overriddenTestingModuleBuilder =
    options.overrideModule?.(testingModuleBuilder);

  if (overriddenTestingModuleBuilder) {
    testingModuleBuilder = overriddenTestingModuleBuilder;
  }

  const moduleRef = await testingModuleBuilder.compile();
  const app = moduleRef.createNestApplication();

  // Enable test mode to skip JWT verification in middleware
  process.env.NODE_ENV = 'test';

  // Add test user middleware BEFORE applyAppConfig so it runs first
  // This ensures req.user is set before the JWT verification middleware
  app.use((req: any, _res: any, next: () => void) => {
    // Set a test user if none exists
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!req.user) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.user = new User({
        userId: 'e2e-test-user',
        email: 'e2e@example.com',
      });
    }
    next();
  });

  applyAppConfig(app);
  await app.init();

  const connection = app.get<Connection>(getConnectionToken());

  return {
    app,
    moduleRef,
    connection,
    databaseName,
    async close(): Promise<void> {
      try {
        if (connection.readyState === ConnectionStates.connected) {
          await connection.dropDatabase();
        }
      } finally {
        await connection.close();
        await app.close();
      }
    },
  };
}
