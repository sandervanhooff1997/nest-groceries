import { CommandBus } from '@nestjs/cqrs';
import { AuditingCommandBus } from './auditing-command-bus';
import { EventLogService } from '../services/event-log.service';
import { UserFactory } from '@common/factories';
import type { IAuditable } from '../interfaces/auditable.interface';
import type { User } from '../entities/user.entity';

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
      UserFactory.create({
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
