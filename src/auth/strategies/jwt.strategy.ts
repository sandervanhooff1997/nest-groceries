import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Types } from 'mongoose';
import type { JwtUserPayload } from '../interfaces/jwt-user-payload.interface';
import { User } from '@shared/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtUserPayload): User {
    if (
      !Types.ObjectId.isValid(payload.sub) ||
      !payload.email ||
      !payload.firstName ||
      !payload.lastName
    ) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return new User({
      _id: new Types.ObjectId(payload.sub),
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
  }
}
