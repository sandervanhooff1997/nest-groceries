import { Types } from 'mongoose';
import request from 'supertest';
import { AuthService } from '@auth/services/auth.service';
import { createE2eApp, type E2eAppContext } from './e2e/create-e2e-app';

interface AuthTokenResponseBody {
  tokenType: string;
  accessToken: string;
  expiresIn: string;
}

describe('AuthController overrides (e2e)', () => {
  let e2eApp: E2eAppContext;
  const issueToken = jest.fn();

  beforeAll(async () => {
    issueToken.mockResolvedValue({
      tokenType: 'Bearer',
      accessToken: 'mock-access-token',
      expiresIn: '3600',
    });

    e2eApp = await createE2eApp({
      testFilePath: __filename,
      overrideModule: (builder) =>
        builder.overrideProvider(AuthService).useValue({
          issueToken,
        }),
    });
  });

  afterAll(async () => {
    await e2eApp.close();
  });

  afterEach(() => {
    issueToken.mockClear();
  });

  it('should allow overriding providers in the e2e test module', async () => {
    const payload = {
      userId: new Types.ObjectId().toString(),
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Smith',
    };

    const response = await request(
      e2eApp.app.getHttpServer() as Parameters<typeof request>[0],
    )
      .post('/api/auth/token')
      .send(payload)
      .expect(201);
    const responseBody = response.body as AuthTokenResponseBody;

    expect(responseBody).toEqual({
      tokenType: 'Bearer',
      accessToken: 'mock-access-token',
      expiresIn: '3600',
    });
    expect(issueToken).toHaveBeenCalledWith(expect.objectContaining(payload));
    expect(e2eApp.databaseName).toMatch(/^e2e-[a-f\d]{24}$/u);
    expect(e2eApp.connection.name).toBe(e2eApp.databaseName);
  });
});
