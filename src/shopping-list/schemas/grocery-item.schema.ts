import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { GroceryItemUnit } from '../enums/grocery-item-unit.enum';

export type GroceryItemDocument = HydratedDocument<GroceryItem>;

@Schema()
export class GroceryItem {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ min: 1 })
  quantity?: number;

  @Prop({ enum: GroceryItemUnit })
  unit?: GroceryItemUnit;

  @Prop({ default: false })
  purchased: boolean;
}

export const groceryItem = SchemaFactory.createForClass(GroceryItem);
