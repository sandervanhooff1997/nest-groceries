import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { User } from '@shared/entities/user.entity';

export class UserFactory {
  static create(partial?: Partial<User>): User {
    return new User({
      _id: new Types.ObjectId(),
      email: faker.internet.email().toLowerCase(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      ...partial,
    });
  }
}
