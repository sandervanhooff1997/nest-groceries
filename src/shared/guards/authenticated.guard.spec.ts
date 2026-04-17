import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';
import { AuthenticatedGuard } from './authenticated.guard';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

function createExecutionContext(
  headers: AuthenticatedRequest['headers'],
): ExecutionContext {
  const request = { headers } as AuthenticatedRequest;

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('AuthenticatedGuard', () => {
  const guard = new AuthenticatedGuard();

  it('should attach the authenticated user from trusted headers', () => {
    const userId = new Types.ObjectId().toString();
    const context = createExecutionContext({
      'x-user-id': userId,
      'x-user-email': 'test@example.com',
      'x-user-first-name': 'Test',
      'x-user-last-name': 'User',
    });

    const result = guard.canActivate(context);
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    expect(result).toBe(true);
    expect(request.user).toBeDefined();
    expect(request.user._id.toString()).toBe(userId);
    expect(request.user.email).toBe('test@example.com');
  });

  it('should reject requests with an invalid user id header', () => {
    const context = createExecutionContext({
      'x-user-id': 'not-an-object-id',
      'x-user-email': 'test@example.com',
      'x-user-first-name': 'Test',
      'x-user-last-name': 'User',
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
