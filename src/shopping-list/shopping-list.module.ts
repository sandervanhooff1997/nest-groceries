import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { SharedModule } from '../shared/shared.module';
import { ShoppingList, shoppingList } from './schemas/shopping-list.schema';
import { ShoppingListController } from './controllers/shopping-list.controller';
import { ShoppingListRepository } from './repositories/shopping-list.repository';
import { IShoppingListRepository } from './constants/shopping-list.constants';

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
    SharedModule,
    MongooseModule.forFeature([
      { name: ShoppingList.name, schema: shoppingList },
    ]),
  ],
  controllers: [ShoppingListController],
  providers: [
    ShoppingListRepository,
    {
      provide: IShoppingListRepository,
      useClass: ShoppingListRepository,
    },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [IShoppingListRepository],
})
export class ShoppingListModule {}
