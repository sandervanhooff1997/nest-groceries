import request from 'supertest';
import { createE2eApp, type E2eAppContext } from './e2e/create-e2e-app';

interface HealthResponseBody {
  status: string;
  timestamp: string;
  services: {
    database: string;
  };
}

describe('HealthController (e2e)', () => {
  let e2eApp: E2eAppContext;

  beforeAll(async () => {
    e2eApp = await createE2eApp({ testFilePath: __filename });
  });

  afterAll(async () => {
    await e2eApp.close();
  });

  it('should use a dedicated database per e2e spec file', () => {
    expect(e2eApp.databaseName).toMatch(/^e2e-[a-f\d]{24}$/u);
    expect(e2eApp.connection.name).toBe(e2eApp.databaseName);
  });

  it('/api/health (GET)', async () => {
    const response = await request(
      e2eApp.app.getHttpServer() as Parameters<typeof request>[0],
    )
      .get('/api/health')
      .expect(200);
    const responseBody = response.body as HealthResponseBody;

    expect(responseBody.status).toBe('healthy');
    expect(responseBody.timestamp).toEqual(expect.any(String));
    expect(responseBody.services).toEqual({ database: 'ok' });
  });
});
