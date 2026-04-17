import { Body, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ShoppingList } from '../entities/shopping-list.entity';
import { CreateShoppingListDto } from '../dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from '../dto/update-shopping-list.dto';
import { CreateShoppingListCommand } from '../commands/handlers/create-shopping-list.handler';
import { UpdateShoppingListCommand } from '../commands/handlers/update-shopping-list.handler';
import { DeleteShoppingListCommand } from '../commands/handlers/delete-shopping-list.handler';
import { FindAllShoppingListsQuery } from '../queries/handlers/find-all-shopping-lists.handler';
import { FindShoppingListByIdQuery } from '../queries/handlers/find-shopping-list-by-id.handler';
import type { ShoppingListDocument } from '../schemas/shopping-list.schema';
import { AuditingCommandBus } from '@shared/buses/auditing-command-bus';
import { AuditingQueryBus } from '@shared/buses/auditing-query-bus';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { User } from '@shared/decorators/user.decorator';
import type { User as AuthenticatedUser } from '@shared/entities/user.entity';

@ApiTags('shopping-lists')
@ApiController('shopping-lists')
export class ShoppingListController {
  constructor(
    public readonly commandBus: AuditingCommandBus,
    public readonly queryBus: AuditingQueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a shopping list' })
  @ApiCreatedResponse({ description: 'The shopping list has been created.' })
  async create(
    @Body() shoppingList: CreateShoppingListDto,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument> {
    const shoppingListPayload = new ShoppingList({
      name: shoppingList.name,
      items: shoppingList.items,
    });

    return await this.commandBus.execute<
      CreateShoppingListCommand,
      ShoppingListDocument
    >(new CreateShoppingListCommand(shoppingListPayload, user));
  }

  @Get()
  @ApiOperation({ summary: "List the current user's shopping lists" })
  @ApiOkResponse({ description: 'Shopping lists retrieved successfully.' })
  async findAll(
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument[]> {
    return await this.queryBus.execute<
      FindAllShoppingListsQuery,
      ShoppingListDocument[]
    >(new FindAllShoppingListsQuery(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shopping list by id for the current user' })
  @ApiOkResponse({ description: 'Shopping list retrieved successfully.' })
  async findById(
    @Param('id') id: string,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument | null> {
    return await this.queryBus.execute<
      FindShoppingListByIdQuery,
      ShoppingListDocument | null
    >(new FindShoppingListByIdQuery(id, user));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shopping list for the current user' })
  @ApiOkResponse({ description: 'Shopping list updated successfully.' })
  async update(
    @Param('id') id: string,
    @Body() shoppingList: UpdateShoppingListDto,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument | null> {
    const shoppingListUpdate: Partial<ShoppingList> = {
      name: shoppingList.name,
      items: shoppingList.items,
    };

    return await this.commandBus.execute<
      UpdateShoppingListCommand,
      ShoppingListDocument | null
    >(new UpdateShoppingListCommand(id, shoppingListUpdate, user));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shopping list for the current user' })
  @ApiOkResponse({ description: 'Shopping list deleted successfully.' })
  async delete(
    @Param('id') id: string,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument | null> {
    return await this.commandBus.execute<
      DeleteShoppingListCommand,
      ShoppingListDocument | null
    >(new DeleteShoppingListCommand(id, user));
  }
}
