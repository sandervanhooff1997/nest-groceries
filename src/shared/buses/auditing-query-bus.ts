import { Injectable } from '@nestjs/common';
import { IQuery, QueryBus } from '@nestjs/cqrs';
import { EventLogService } from '../services/event-log.service';
import type { IAuditable } from '../interfaces/auditable.interface';

function isAuditable(value: unknown): value is IAuditable {
  return typeof value === 'object' && value !== null && 'user' in value;
}

@Injectable()
export class AuditingQueryBus {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly eventLogService: EventLogService,
  ) {}

  async execute<T extends IQuery, R = any>(query: T): Promise<R> {
    if (isAuditable(query)) {
      await this.eventLogService.log(query, query.constructor.name);
    }
    return await this.queryBus.execute<T, R>(query);
  }
}
