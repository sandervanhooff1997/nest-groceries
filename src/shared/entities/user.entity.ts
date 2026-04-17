import { Types } from 'mongoose';

export class User {
  _id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
