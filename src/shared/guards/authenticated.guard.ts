import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';
import { IS_PUBLIC_ROUTE_KEY } from '@auth/decorators/public.decorator';
import type { User } from '../entities/user.entity';

@Injectable()
export class AuthenticatedGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = User>(
    err: unknown,
    user: TUser | false,
    _info: unknown,
    _context: ExecutionContext,
  ): TUser {
    void _info;
    void _context;

    if (err instanceof Error) {
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException('Missing or invalid bearer token');
    }

    return user;
  }
}
