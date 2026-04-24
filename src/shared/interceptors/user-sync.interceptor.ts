import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class UserSyncInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user?.userId) {
      const persisted = await this.userService.getOrCreateUser(request.user);
      // Hydrate internal _id (and any DB-stored fields) onto the request user
      // so downstream handlers can read both `userId` (Kinde) and `_id` (Mongo).
      request.user._id = persisted._id;
      request.user.email = persisted.email;
      request.user.firstName = persisted.firstName;
      request.user.lastName = persisted.lastName;
    }

    return next.handle();
  }
}
