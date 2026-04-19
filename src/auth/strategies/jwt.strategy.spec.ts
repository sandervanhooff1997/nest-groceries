import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-kinde-public-key'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);
  });

  it('should map a valid payload into the authenticated user object', () => {
    const user = strategy.validate({
      sub: '507f1f77bcf86cd799439011',
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Smith',
    });

    expect(user._id.toString()).toBe('507f1f77bcf86cd799439011');
    expect(user.email).toBe('alex@example.com');
    expect(user.firstName).toBe('Alex');
    expect(user.lastName).toBe('Smith');
  });

  it('should map non-objectId Kinde subjects to deterministic object ids', () => {
    const user = strategy.validate({
      sub: 'kp_abc123',
      email: 'alex@example.com',
      given_name: 'Alex',
      family_name: 'Smith',
    });

    expect(user._id.toString()).toHaveLength(24);
    expect(user.email).toBe('alex@example.com');
  });

  it('should reject invalid token payloads', () => {
    expect(() =>
      strategy.validate({
        sub: '',
        email: '',
      }),
    ).toThrow(UnauthorizedException);
  });
});
