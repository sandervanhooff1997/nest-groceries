import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CommandBus, ICommand } from '@nestjs/cqrs';
import { EventLogService } from '../services/event-log.service';
import type { IAuditable } from '../interfaces/auditable.interface';

function isAuditable(value: unknown): value is IAuditable {
  return typeof value === 'object' && value !== null && 'user' in value;
}

@Injectable()
export class AuditingCommandBus extends CommandBus {
  constructor(
    moduleRef: ModuleRef,
    private readonly eventLogService: EventLogService,
  ) {
    super(moduleRef);
  }

  async execute<T extends ICommand, R = any>(command: T): Promise<R> {
    if (isAuditable(command)) {
      await this.eventLogService.log(command, command.constructor.name);
    }
    return super.execute(command);
  }
}
