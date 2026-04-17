import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { IssueTokenDto } from '../dto/issue-token.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'getOrThrow'>>;

  beforeEach(() => {
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-jwt-token'),
    };
    configService = {
      getOrThrow: jest.fn().mockReturnValue(3600),
    };

    service = new AuthService(
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  it('should issue a bearer token from the provided user claims', async () => {
    const dto: IssueTokenDto = {
      userId: '507f1f77bcf86cd799439011',
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Smith',
    };

    await expect(service.issueToken(dto)).resolves.toEqual({
      tokenType: 'Bearer',
      accessToken: 'signed-jwt-token',
      expiresIn: '3600',
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: dto.userId,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_EXPIRES_IN');
  });
});
