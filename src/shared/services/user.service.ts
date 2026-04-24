import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Looks up the user by their Kinde `userId`. If absent, persists a fresh
   * record. Returns the entity with the internal Mongo `_id` populated.
   */
  async getOrCreateUser(user: User): Promise<User> {
    const existing = await this.userRepository.findByUserId(user.userId);
    if (existing) {
      return existing;
    }
    return this.userRepository.upsertByUserId(user);
  }

  async getUserById(_id: string): Promise<User | null> {
    return this.userRepository.findById(_id);
  }

  async getUserByUserId(userId: string): Promise<User | null> {
    return this.userRepository.findByUserId(userId);
  }

  async getUsersByIds(_ids: string[]): Promise<User[]> {
    return this.userRepository.findByIds(_ids);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
