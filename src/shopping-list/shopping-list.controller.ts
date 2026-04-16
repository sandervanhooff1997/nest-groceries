import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ShoppingListEntity } from './entities/shopping-list.entity';
import { CreateShoppingListCommand } from './commands/handlers/create-shopping-list.handler';
import { UpdateShoppingListCommand } from './commands/handlers/update-shopping-list.handler';
import { DeleteShoppingListCommand } from './commands/handlers/delete-shopping-list.handler';
import { FindAllShoppingListsQuery } from './queries/handlers/find-all-shopping-lists.handler';
import { FindShoppingListByIdQuery } from './queries/handlers/find-shopping-list-by-id.handler';

@Controller('shopping-lists')
export class ShoppingListController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() shoppingList: ShoppingListEntity) {
    return await this.commandBus.execute(
      new CreateShoppingListCommand(shoppingList),
    );
  }

  @Get()
  async findAll() {
    return await this.queryBus.execute(new FindAllShoppingListsQuery());
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.queryBus.execute(new FindShoppingListByIdQuery(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() shoppingList: Partial<ShoppingListEntity>,
  ) {
    return await this.commandBus.execute(
      new UpdateShoppingListCommand(id, shoppingList),
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.commandBus.execute(new DeleteShoppingListCommand(id));
  }
}
