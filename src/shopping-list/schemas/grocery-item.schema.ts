import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GroceryItemUnit } from '../enums/grocery-item-unit.enum';

@Schema({ _id: false })
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
