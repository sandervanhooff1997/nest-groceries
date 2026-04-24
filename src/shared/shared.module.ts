import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventLog, eventLogSchema } from './schemas/event-log.schema';
import { EventLogService } from './services/event-log.service';
import { User, userSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { UserSyncInterceptor } from './interceptors/user-sync.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventLog.name, schema: eventLogSchema },
      { name: User.name, schema: userSchema },
    ]),
  ],
  providers: [
    EventLogService,
    UserRepository,
    UserService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserSyncInterceptor,
    },
  ],
  exports: [EventLogService, UserService, UserRepository],
})
export class SharedModule {}
