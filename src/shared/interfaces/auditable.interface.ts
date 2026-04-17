import type { User } from '../entities/user.entity';

export interface IAuditable {
  readonly user: User;
}
