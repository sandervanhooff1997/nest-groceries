import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class GroceryItem {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ min: 1 })
  quantity?: number;

  @Prop({ trim: true })
  unit?: string;

  @Prop({ default: false })
  purchased: boolean;
}

export const GroceryItemSchema = SchemaFactory.createForClass(GroceryItem);
