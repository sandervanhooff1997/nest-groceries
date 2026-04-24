import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  _id?: Types.ObjectId;

  /** Kinde user id (the `sub` claim). External, stable. */
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const userSchema = SchemaFactory.createForClass(User);
