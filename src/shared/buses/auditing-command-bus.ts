import { Injectable } from '@nestjs/common';
import { CommandBus, ICommand } from '@nestjs/cqrs';
import { EventLogService } from '../services/event-log.service';
import type { IAuditable } from '../interfaces/auditable.interface';

function isAuditable(value: unknown): value is IAuditable {
  return typeof value === 'object' && value !== null && 'user' in value;
}

@Injectable()
export class AuditingCommandBus {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventLogService: EventLogService,
  ) {}

  async execute<T extends ICommand, R = any>(command: T): Promise<R> {
    if (isAuditable(command)) {
      await this.eventLogService.log(command, command.constructor.name);
    }
    return await this.commandBus.execute<T, R>(command);
  }
}
