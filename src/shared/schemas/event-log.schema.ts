import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class EventLog {
  @Prop({ required: true })
  operation: string;

  @Prop({ required: true })
  userId: string;

  // Kinde access tokens don't always carry an email claim (depends on the
  // tenant's token customisation). Keep this optional so audit writes don't
  // crash when the only thing we have is the `sub` identifier.
  @Prop()
  userEmail?: string;
}

export const eventLogSchema = SchemaFactory.createForClass(EventLog);
