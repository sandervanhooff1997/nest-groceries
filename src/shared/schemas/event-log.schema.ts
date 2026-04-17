import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class EventLog {
  @Prop({ required: true })
  operation: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userEmail: string;
}

export const eventLogSchema = SchemaFactory.createForClass(EventLog);
