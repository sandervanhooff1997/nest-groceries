import request from 'supertest';
import { createE2eApp } from '@test/e2e/create-e2e-app';
import { registerE2eAppLifecycle } from '@test/e2e/helpers/e2e-test-helpers';

interface HealthResponseBody {
  status: string;
  timestamp: string;
  services: {
    database: string;
  };
}

describe('HealthController (e2e)', () => {
  const e2e = registerE2eAppLifecycle(createE2eApp, __filename);

  it('should use a dedicated database per e2e spec file', () => {
    expect(e2e.app().databaseName).toMatch(/^e2e-[a-f\d]{24}$/u);
    expect(e2e.app().connection.name).toBe(e2e.app().databaseName);
  });

  it('/api/health (GET)', async () => {
    const response = await request(e2e.httpServer())
      .get('/api/health')
      .expect(200);
    const responseBody = response.body as HealthResponseBody;

    expect(responseBody.status).toBe('healthy');
    expect(responseBody.timestamp).toEqual(expect.any(String));
    expect(responseBody.services).toEqual({ database: 'ok' });
  });
});
