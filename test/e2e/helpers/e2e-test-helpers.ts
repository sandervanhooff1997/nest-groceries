import request from 'supertest';
import type {
  CreateE2eAppOptions,
  E2eAppContext,
} from '@test/e2e/create-e2e-app';

export interface E2eTestHarness {
  app(): E2eAppContext;
  httpServer(): Parameters<typeof request>[0];
}

export function registerE2eAppLifecycle(
  createApp: (options: CreateE2eAppOptions) => Promise<E2eAppContext>,
  testFilePath: string,
  overrideModule?: CreateE2eAppOptions['overrideModule'],
): E2eTestHarness {
  let e2eApp!: E2eAppContext;

  beforeAll(async () => {
    e2eApp = await createApp({ testFilePath, overrideModule });
  });

  afterAll(async () => {
    await e2eApp.close();
  });

  return {
    app(): E2eAppContext {
      return e2eApp;
    },
    httpServer(): Parameters<typeof request>[0] {
      return e2eApp.app.getHttpServer() as Parameters<typeof request>[0];
    },
  };
}
