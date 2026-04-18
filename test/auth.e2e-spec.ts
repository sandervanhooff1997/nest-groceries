import { Types } from 'mongoose';
import request from 'supertest';
import { AuthService } from '@auth/services/auth.service';
import { createE2eApp } from '@test/e2e/create-e2e-app';
import { registerE2eAppLifecycle } from '@test/e2e/helpers/e2e-test-helpers';

interface AuthTokenResponseBody {
  tokenType: string;
  accessToken: string;
  expiresIn: string;
}

describe('AuthController overrides (e2e)', () => {
  const issueToken = jest.fn();

  beforeAll(() => {
    issueToken.mockResolvedValue({
      tokenType: 'Bearer',
      accessToken: 'mock-access-token',
      expiresIn: '3600',
    });
  });

  const e2e = registerE2eAppLifecycle(createE2eApp, __filename, (builder) =>
    builder.overrideProvider(AuthService).useValue({
      issueToken,
    }),
  );

  it('should allow overriding providers in the e2e test module', async () => {
    const payload = {
      userId: new Types.ObjectId().toString(),
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Smith',
    };

    const response = await request(e2e.httpServer())
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
    expect(e2e.app().databaseName).toMatch(/^e2e-[a-f\d]{24}$/u);
    expect(e2e.app().connection.name).toBe(e2e.app().databaseName);
  });
});
