import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_ROUTE_KEY } from '@auth/decorators/public.decorator';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user?.userId) {
      throw new UnauthorizedException('Missing or invalid bearer token');
    }

    return true;
  }
}
