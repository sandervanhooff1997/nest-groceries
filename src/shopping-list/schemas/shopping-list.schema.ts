import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GroceryItem, groceryItem } from './grocery-item.schema';

export type ShoppingListDocument = HydratedDocument<ShoppingList>;

@Schema({ timestamps: true })
export class ShoppingList {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  nextId?: string;

  @Prop({ type: [groceryItem], default: [] })
  items: GroceryItem[];

  /** Kinde `userId` of the original creator. */
  @Prop({ required: true, trim: true })
  createdBy: string;

  /** Kinde `userId` of the last actor who mutated the list. */
  @Prop({ required: true, trim: true })
  updatedBy: string;

  /** Internal user `_id`s (not Kinde ids) for users granted co-owner access. */
  @Prop({ type: [String], default: [] })
  ownerIds: string[];

  /** Internal user `_id`s (not Kinde ids) for users granted participant access. */
  @Prop({ type: [String], default: [] })
  participantIds: string[];

  @Prop({ type: Boolean, default: false })
  isTemplate: boolean;

  @Prop({
    type: String,
    default: () => new Types.ObjectId().toString(),
  })
  _id?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const shoppingList = SchemaFactory.createForClass(ShoppingList);
