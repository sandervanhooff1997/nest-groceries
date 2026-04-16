import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import {
  ShoppingList,
  ShoppingListSchema,
} from './schemas/shopping-list.schema';
import { ShoppingListController } from './shopping-list.controller';
import { ShoppingListRepository } from './repository/shopping-list.repository';
import { SHOPPING_LIST_REPOSITORY } from './constants/shopping-list.constants';

// Command Handlers
import { CreateShoppingListHandler } from './commands/handlers/create-shopping-list.handler';
import { UpdateShoppingListHandler } from './commands/handlers/update-shopping-list.handler';
import { DeleteShoppingListHandler } from './commands/handlers/delete-shopping-list.handler';

// Query Handlers
import { FindAllShoppingListsHandler } from './queries/handlers/find-all-shopping-lists.handler';
import { FindShoppingListByIdHandler } from './queries/handlers/find-shopping-list-by-id.handler';

const commandHandlers = [
  CreateShoppingListHandler,
  UpdateShoppingListHandler,
  DeleteShoppingListHandler,
];

const queryHandlers = [
  FindAllShoppingListsHandler,
  FindShoppingListByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: ShoppingList.name, schema: ShoppingListSchema },
    ]),
  ],
  controllers: [ShoppingListController],
  providers: [
    ShoppingListRepository,
    {
      provide: SHOPPING_LIST_REPOSITORY,
      useClass: ShoppingListRepository,
    },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [SHOPPING_LIST_REPOSITORY],
})
export class ShoppingListModule {}
