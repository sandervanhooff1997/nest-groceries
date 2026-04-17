import { QueryBus } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { AuditingQueryBus } from './auditing-query-bus';
import { EventLogService } from '../services/event-log.service';
import { User } from '../entities/user.entity';
import type { IAuditable } from '../interfaces/auditable.interface';

class TestQuery implements IAuditable {
  constructor(public readonly user: User) {}
}

describe('AuditingQueryBus', () => {
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let eventLogService: jest.Mocked<Pick<EventLogService, 'log'>>;
  let auditingQueryBus: AuditingQueryBus;

  beforeEach(() => {
    queryBus = {
      execute: jest.fn().mockResolvedValue([]),
    };
    eventLogService = {
      log: jest.fn().mockResolvedValue(undefined),
    };
    auditingQueryBus = new AuditingQueryBus(
      queryBus as unknown as QueryBus,
      eventLogService as unknown as EventLogService,
    );
  });

  it('should log auditable queries before delegating execution', async () => {
    const query = new TestQuery(
      new User({
        _id: new Types.ObjectId(),
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
      }),
    );

    await expect(auditingQueryBus.execute(query)).resolves.toEqual([]);

    expect(eventLogService.log).toHaveBeenCalledWith(query, TestQuery.name);
    expect(queryBus.execute).toHaveBeenCalledWith(query);
  });
});
