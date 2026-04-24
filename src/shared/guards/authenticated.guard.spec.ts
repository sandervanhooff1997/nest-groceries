import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { AuthenticatedGuard } from './authenticated.guard';

function createExecutionContext(user?: { userId: string }): ExecutionContext {
  return {
    getClass: () => AuthenticatedGuard,
    getHandler: () => createExecutionContext,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('AuthenticatedGuard', () => {
  let reflector: Reflector;
  let guard: AuthenticatedGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;
    guard = new AuthenticatedGuard(reflector);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should bypass authentication for public routes', () => {
    const context = createExecutionContext();

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow requests when Kinde middleware attached a user', () => {
    const context = createExecutionContext({ userId: 'kp_user_123' });

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject protected routes without an authenticated user', () => {
    const context = createExecutionContext();

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
