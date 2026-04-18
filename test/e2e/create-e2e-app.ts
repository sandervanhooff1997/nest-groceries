import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import {
  Test,
  type TestingModule,
  type TestingModuleBuilder,
} from '@nestjs/testing';
import { ConnectionStates, type Connection } from 'mongoose';
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
