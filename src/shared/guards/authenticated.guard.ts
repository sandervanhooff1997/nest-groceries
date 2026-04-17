import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { User } from '../entities/user.entity';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = this.getHeaderValue(request.headers['x-user-id']);
    const email = this.getHeaderValue(request.headers['x-user-email']);
    const firstName = this.getHeaderValue(request.headers['x-user-first-name']);
    const lastName = this.getHeaderValue(request.headers['x-user-last-name']);

    if (
      !userId ||
      !Types.ObjectId.isValid(userId) ||
      !email ||
      !firstName ||
      !lastName
    ) {
      throw new UnauthorizedException('Missing authenticated user headers');
    }

    request.user = new User({
      _id: new Types.ObjectId(userId),
      email,
      firstName,
      lastName,
    });

    return true;
  }

  private getHeaderValue(
    header: string | string[] | undefined,
  ): string | undefined {
    return Array.isArray(header) ? header[0] : header;
  }
}
