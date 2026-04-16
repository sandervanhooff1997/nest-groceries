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
import { CreateShoppingListCommand } from './commands/impl/create-shopping-list.command';
import { UpdateShoppingListCommand } from './commands/impl/update-shopping-list.command';
import { DeleteShoppingListCommand } from './commands/impl/delete-shopping-list.command';
import { FindAllShoppingListsQuery } from './queries/impl/find-all-shopping-lists.query';
import { FindShoppingListByIdQuery } from './queries/impl/find-shopping-list-by-id.query';

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
