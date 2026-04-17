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
    await this.eventLogModel.create({
      operation,
      userId: auditable.user._id.toString(),
      userEmail: auditable.user.email,
    });
  }
}
