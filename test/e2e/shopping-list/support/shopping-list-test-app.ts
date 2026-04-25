import type { ExecutionContext } from '@nestjs/common';
import type { TestingModuleBuilder } from '@nestjs/testing';
import { Types } from 'mongoose';
import { User } from '@shared/entities/user.entity';
import { AuthenticatedGuard } from '@shared/guards/authenticated.guard';
import type { AuthenticatedRequest } from '@shared/interfaces/authenticated-request.interface';
import {
  createE2eApp,
  type CreateE2eAppOptions,
  type E2eAppContext,
} from '@test/e2e/create-e2e-app';

export const E2E_SHOPPING_LIST_USER = new User({
  _id: new Types.ObjectId().toString(),
  email: 'shopping-list-e2e@example.com',
  firstName: 'Shopping',
  lastName: 'Tester',
});

function withAuthenticatedUser(
  builder: TestingModuleBuilder,
): TestingModuleBuilder {
  return builder.overrideProvider(AuthenticatedGuard).useValue({
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      request.user = E2E_SHOPPING_LIST_USER;
      return true;
    },
  });
}

export async function createShoppingListE2eApp(
  options: Pick<CreateE2eAppOptions, 'testFilePath' | 'overrideModule'>,
): Promise<E2eAppContext> {
  process.env.NODE_ENV = 'test';
  return await createE2eApp({
    testFilePath: options.testFilePath,
    overrideModule: (builder) => {
      const builderWithUser = withAuthenticatedUser(builder);
      const overriddenBuilder = options.overrideModule?.(builderWithUser);

      return overriddenBuilder ?? builderWithUser;
    },
  });
}
