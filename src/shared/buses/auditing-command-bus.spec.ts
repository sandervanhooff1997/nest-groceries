import { CommandBus } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { AuditingCommandBus } from './auditing-command-bus';
import { EventLogService } from '../services/event-log.service';
import { User } from '../entities/user.entity';
import type { IAuditable } from '../interfaces/auditable.interface';

class TestCommand implements IAuditable {
  constructor(public readonly user: User) {}
}

describe('AuditingCommandBus', () => {
  let commandBus: jest.Mocked<Pick<CommandBus, 'execute'>>;
  let eventLogService: jest.Mocked<Pick<EventLogService, 'log'>>;
  let auditingCommandBus: AuditingCommandBus;

  beforeEach(() => {
    commandBus = {
      execute: jest.fn().mockResolvedValue('ok'),
    };
    eventLogService = {
      log: jest.fn().mockResolvedValue(undefined),
    };
    auditingCommandBus = new AuditingCommandBus(
      commandBus as unknown as CommandBus,
      eventLogService as unknown as EventLogService,
    );
  });

  it('should log auditable commands before delegating execution', async () => {
    const command = new TestCommand(
      new User({
        _id: new Types.ObjectId(),
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
      }),
    );

    await expect(auditingCommandBus.execute(command)).resolves.toBe('ok');

    expect(eventLogService.log).toHaveBeenCalledWith(command, TestCommand.name);
    expect(commandBus.execute).toHaveBeenCalledWith(command);
  });
});
