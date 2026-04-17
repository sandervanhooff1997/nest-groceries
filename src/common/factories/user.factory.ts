import { Types } from 'mongoose';
import { User } from '@shared/entities/user.entity';

export class UserFactory {
  static create(partial?: Partial<User>): User {
    return new User({
      _id: new Types.ObjectId(),
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      ...partial,
    });
  }
}
