import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';
import { AuthenticatedGuard } from './authenticated.guard';
import { User } from '../entities/user.entity';

function createExecutionContext(): ExecutionContext {
  return {
    getClass: () => AuthenticatedGuard,
    getHandler: () => createExecutionContext,
    switchToHttp: () => ({
      getRequest: () => ({}),
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
    const parentCanActivate = jest.spyOn(
      Object.getPrototypeOf(AuthenticatedGuard.prototype),
      'canActivate',
    );

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
    expect(parentCanActivate).not.toHaveBeenCalled();
  });

  it('should delegate protected routes to passport', () => {
    const context = createExecutionContext();
    const parentCanActivate = jest
      .spyOn(Object.getPrototypeOf(AuthenticatedGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    expect(guard.canActivate(context)).toBe(true);
    expect(parentCanActivate).toHaveBeenCalledWith(context);
  });

  it('should return the authenticated user when the token is valid', () => {
    const context = createExecutionContext();
    const userId = new Types.ObjectId();
    const user = new User({
      _id: userId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(guard.handleRequest(null, user, null, context)).toBe(user);
  });

  it('should reject missing authenticated users', () => {
    const context = createExecutionContext();

    expect(() => guard.handleRequest(null, false, null, context)).toThrow(
      UnauthorizedException,
    );
  });

  it('should rethrow existing passport errors', () => {
    const context = createExecutionContext();
    const error = new UnauthorizedException('Token expired');

    expect(() => guard.handleRequest(error, false, null, context)).toThrow(
      error,
    );
  });
});
