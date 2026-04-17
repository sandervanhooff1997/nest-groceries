import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { EventLog, eventLogSchema } from './schemas/event-log.schema';
import { EventLogService } from './services/event-log.service';
import { AuditingCommandBus } from './buses/auditing-command-bus';
import { AuditingQueryBus } from './buses/auditing-query-bus';
import { AuditingEventBus } from './buses/auditing-event-bus';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventLog.name, schema: eventLogSchema },
    ]),
  ],
  providers: [
    AuthenticatedGuard,
    EventLogService,
    AuditingCommandBus,
    AuditingQueryBus,
    AuditingEventBus,
    { provide: CommandBus, useExisting: AuditingCommandBus },
    { provide: QueryBus, useExisting: AuditingQueryBus },
    { provide: EventBus, useExisting: AuditingEventBus },
  ],
  exports: [
    AuthenticatedGuard,
    EventLogService,
    { provide: CommandBus, useExisting: AuditingCommandBus },
    { provide: QueryBus, useExisting: AuditingQueryBus },
    { provide: EventBus, useExisting: AuditingEventBus },
  ],
})
export class SharedModule {}
