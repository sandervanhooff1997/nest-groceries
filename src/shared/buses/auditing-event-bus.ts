import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  CommandBus,
  EventBus,
  IEvent,
  UnhandledExceptionBus,
} from '@nestjs/cqrs';
import { EventLogService } from '../services/event-log.service';
import type { IAuditable } from '../interfaces/auditable.interface';

function isAuditable(value: unknown): value is IAuditable {
  return typeof value === 'object' && value !== null && 'user' in value;
}

@Injectable()
export class AuditingEventBus extends EventBus {
  constructor(
    commandBus: CommandBus,
    moduleRef: ModuleRef,
    unhandledExceptionBus: UnhandledExceptionBus,
    private readonly eventLogService: EventLogService,
  ) {
    super(commandBus, moduleRef, unhandledExceptionBus);
  }

  publish<T extends IEvent>(event: T): any {
    if (isAuditable(event)) {
      void this.eventLogService.log(event, event.constructor.name);
    }
    return super.publish(event);
  }

  publishAll<T extends IEvent>(events: T[]): void {
    events.forEach((event) => {
      this.publish(event);
    });
  }
}
