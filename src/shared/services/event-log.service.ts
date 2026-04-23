import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventLog } from '../schemas/event-log.schema';
import type { IAuditable } from '../interfaces/auditable.interface';

@Injectable()
export class EventLogService {
  constructor(
    @InjectModel(EventLog.name)
    private readonly eventLogModel: Model<EventLog>,
  ) {}

  async log(auditable: IAuditable, operation: string): Promise<void> {
    // Defensive: guards upstream already enforce a non-empty _id, but we'd
    // rather skip the audit write than crash an otherwise-successful request
    // if something changes and the user shape is malformed.
    const userId = auditable.user?._id?.toString();
    if (!userId) {
      return;
    }

    await this.eventLogModel.create({
      operation,
      userId,
      userEmail: auditable.user.email,
    });
  }
}
