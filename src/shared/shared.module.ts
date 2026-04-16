import { Module } from '@nestjs/common';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Module({
  providers: [AuthenticatedGuard],
  exports: [AuthenticatedGuard],
})
export class SharedModule {}
