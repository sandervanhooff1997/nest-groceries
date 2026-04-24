export class User {
  /** Internal Mongo ObjectId (as string). Undefined until the user is persisted. */
  _id?: string;
  /** Stable external identifier from Kinde — the `sub` claim on the JWT. */
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;

  constructor(partial?: Partial<User>) {
    this.userId = '';
    Object.assign(this, partial);
  }

  get fullName(): string {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  }
}
