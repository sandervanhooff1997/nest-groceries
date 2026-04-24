import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User as UserEntity } from '../entities/user.entity';
import { User as UserSchema } from '../schemas/user.schema';

type UserDoc = UserSchema & { _id: { toString(): string } };

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserSchema.name) private readonly model: Model<UserSchema>,
  ) {}

  async findById(_id: string): Promise<UserEntity | null> {
    const doc = await this.model.findById(_id).exec();
    return doc ? this.toEntity(doc as UserDoc) : null;
  }

  async findByIds(_ids: string[]): Promise<UserEntity[]> {
    if (_ids.length === 0) return [];
    const docs = await this.model.find({ _id: { $in: _ids } }).exec();
    return docs.map((doc) => this.toEntity(doc as UserDoc));
  }

  async findByUserId(userId: string): Promise<UserEntity | null> {
    const doc = await this.model.findOne({ userId }).exec();
    return doc ? this.toEntity(doc as UserDoc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.model.findOne({ email }).exec();
    return doc ? this.toEntity(doc as UserDoc) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const doc = new this.model({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    const saved = await doc.save();
    return this.toEntity(saved as UserDoc);
  }

  async upsertByUserId(user: UserEntity): Promise<UserEntity> {
    const doc = await this.model
      .findOneAndUpdate(
        { userId: user.userId },
        {
          $set: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          $setOnInsert: { userId: user.userId },
        },
        { new: true, upsert: true, runValidators: true },
      )
      .exec();
    return this.toEntity(doc as UserDoc);
  }

  private toEntity(doc: UserDoc): UserEntity {
    return new UserEntity({
      _id: doc._id.toString(),
      userId: doc.userId,
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
    });
  }
}
