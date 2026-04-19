import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { createHash } from 'node:crypto';
import { Types } from 'mongoose';
import { User } from '@shared/entities/user.entity';

type KindeJwtPayload = {
  sub?: string;
  user_id?: string;
  email?: string;
  preferred_email?: string;
  given_name?: string;
  family_name?: string;
  firstName?: string;
  lastName?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const kindePublicKey = configService.getOrThrow<string>('KINDE_PUBLIC_KEY');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: kindePublicKey,
      algorithms: ['RS256'],
    });
  }

  validate(payload: KindeJwtPayload): User {
    const kindeId = payload.sub ?? payload.user_id;
    const email = payload.email ?? payload.preferred_email;
    const givenName = payload.given_name ?? payload.firstName ?? '';
    const familyName = payload.family_name ?? payload.lastName ?? '';

    if (
      typeof kindeId !== 'string' ||
      kindeId.trim().length === 0 ||
      typeof email !== 'string' ||
      email.trim().length === 0
    ) {
      throw new UnauthorizedException('Invalid Kinde token payload');
    }

    const objectIdHex = Types.ObjectId.isValid(kindeId)
      ? kindeId
      : createHash('sha256').update(kindeId).digest('hex').slice(0, 24);
    const objectId = new Types.ObjectId(objectIdHex);

    return new User({
      _id: objectId,
      email,
      firstName: givenName,
      lastName: familyName,
    });
  }
}
