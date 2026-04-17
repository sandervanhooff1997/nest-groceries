import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { AuthTokenResponseDto } from '../dto/auth-token-response.dto';
import { IssueTokenDto } from '../dto/issue-token.dto';
import type { JwtUserPayload } from '../interfaces/jwt-user-payload.interface';
import { User } from '@shared/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issueToken(dto: IssueTokenDto): Promise<AuthTokenResponseDto> {
    const user = this.buildUser(dto);
    const payload = this.buildPayload(user);
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      tokenType: 'Bearer',
      accessToken,
      expiresIn: this.configService
        .getOrThrow<number>('JWT_EXPIRES_IN')
        .toString(),
    };
  }

  private buildUser(dto: IssueTokenDto): User {
    return new User({
      _id: new Types.ObjectId(dto.userId),
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
  }

  private buildPayload(user: User): JwtUserPayload {
    return {
      sub: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
