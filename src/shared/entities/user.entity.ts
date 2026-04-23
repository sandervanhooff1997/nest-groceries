export class User {
  /**
   * Stable per-user identifier. When tokens come from Kinde this is the `sub`
   * claim (a string like `kp_...`), not a Mongo ObjectId. Consumers call
   * `_id.toString()` pervasively, which is still safe on a string.
   */
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }

  get fullName(): string {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  }
}
