import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ShoppingListEntity } from './entities/shopping-list.entity';
import { CreateShoppingListCommand } from './commands/handlers/create-shopping-list.handler';
import { UpdateShoppingListCommand } from './commands/handlers/update-shopping-list.handler';
import { DeleteShoppingListCommand } from './commands/handlers/delete-shopping-list.handler';
import { FindAllShoppingListsQuery } from './queries/handlers/find-all-shopping-lists.handler';
import { FindShoppingListByIdQuery } from './queries/handlers/find-shopping-list-by-id.handler';
import type { ShoppingListDocument } from './schemas/shopping-list.schema';
import { UserDecorator } from '../shared/decorators/user.decorator';
import type { User } from '../shared/entities/user.entity';
import { AuthenticatedGuard } from '../shared/guards/authenticated.guard';

@Controller('shopping-lists')
@UseGuards(AuthenticatedGuard)
export class ShoppingListController {
  constructor(
    public readonly commandBus: CommandBus,
    public readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(
    @Body() shoppingList: ShoppingListEntity,
    @UserDecorator() user: User,
  ): Promise<ShoppingListDocument> {
    return await this.commandBus.execute<
      CreateShoppingListCommand,
      ShoppingListDocument
    >(new CreateShoppingListCommand(shoppingList, user));
  }

  @Get()
  async findAll(@UserDecorator() user: User): Promise<ShoppingListDocument[]> {
    return await this.queryBus.execute<
      FindAllShoppingListsQuery,
      ShoppingListDocument[]
    >(new FindAllShoppingListsQuery(user));
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @UserDecorator() user: User,
  ): Promise<ShoppingListDocument | null> {
    return await this.queryBus.execute<
      FindShoppingListByIdQuery,
      ShoppingListDocument | null
    >(new FindShoppingListByIdQuery(id, user));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() shoppingList: Partial<ShoppingListEntity>,
    @UserDecorator() user: User,
  ): Promise<ShoppingListDocument | null> {
    return await this.commandBus.execute<
      UpdateShoppingListCommand,
      ShoppingListDocument | null
    >(new UpdateShoppingListCommand(id, shoppingList, user));
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @UserDecorator() user: User,
  ): Promise<ShoppingListDocument | null> {
    return await this.commandBus.execute<
      DeleteShoppingListCommand,
      ShoppingListDocument | null
    >(new DeleteShoppingListCommand(id, user));
  }
}
