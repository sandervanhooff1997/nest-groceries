import { Injectable } from '@nestjs/common';
import { EventBus, IEvent } from '@nestjs/cqrs';
import { EventLogService } from '../services/event-log.service';
import type { IAuditable } from '../interfaces/auditable.interface';

function isAuditable(value: unknown): value is IAuditable {
  return typeof value === 'object' && value !== null && 'user' in value;
}

@Injectable()
export class AuditingEventBus {
  constructor(
    private readonly eventBus: EventBus,
    private readonly eventLogService: EventLogService,
  ) {}

  publish<T extends IEvent>(event: T): any {
    if (isAuditable(event)) {
      void this.eventLogService.log(event, event.constructor.name);
    }
    return this.eventBus.publish(event);
  }

  publishAll<T extends IEvent>(events: T[]): void {
    for (const event of events) {
      this.publish(event);
    }
  }
}
