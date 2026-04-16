import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GroceryItem, GroceryItemSchema } from './grocery-item.schema';

export type ShoppingListDocument = HydratedDocument<ShoppingList>;

@Schema({ timestamps: true })
export class ShoppingList {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: [GroceryItemSchema], default: [] })
  items: GroceryItem[];

  @Prop({ required: true, trim: true })
  createdBy: string;

  @Prop({ required: true, trim: true })
  updatedBy: string;

  @Prop()
  _id?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingList);
