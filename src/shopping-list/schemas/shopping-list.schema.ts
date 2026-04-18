import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
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

  @Prop({ required: true, trim: true })
  createdBy: string;

  @Prop({ required: true, trim: true })
  updatedBy: string;

  @Prop()
  _id?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const shoppingList = SchemaFactory.createForClass(ShoppingList);
