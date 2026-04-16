import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ShoppingListDocument = HydratedDocument<ShoppingList>;

@Schema()
export class ShoppingList {
  @Prop()
  _id?: string;
}

export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingList);

