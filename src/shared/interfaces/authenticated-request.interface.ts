import { Request } from 'express';
import type { User } from '../entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
}
