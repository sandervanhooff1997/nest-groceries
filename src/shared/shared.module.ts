import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventLog, eventLogSchema } from './schemas/event-log.schema';
import { EventLogService } from './services/event-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventLog.name, schema: eventLogSchema },
    ]),
  ],
  providers: [EventLogService],
  exports: [EventLogService],
})
export class SharedModule {}
