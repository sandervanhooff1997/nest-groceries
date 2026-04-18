import { Body, Delete, Post, Param } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AddGroceryItemCommand } from '@shopping-list/commands/handlers/add-grocery-item.handler';
import { RemoveGroceryItemCommand } from '@shopping-list/commands/handlers/remove-grocery-item.handler';
import { GroceryItemDto } from '@shopping-list/dto/create-shopping-list.dto';
import { GroceryItem } from '@shopping-list/entities/grocery-item.entity';
import type { ShoppingListDocument } from '@shopping-list/schemas/shopping-list.schema';
import { AuditingCommandBus } from '@shared/buses/auditing-command-bus';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { User } from '@shared/decorators/user.decorator';
import type { User as AuthenticatedUser } from '@shared/entities/user.entity';

@ApiTags('shopping-lists')
@ApiController('shopping-lists/:id/items')
export class GroceryItemsController {
  constructor(public readonly commandBus: AuditingCommandBus) {}

  @Post()
  @ApiOperation({ summary: 'Add a grocery item to a shopping list' })
  @ApiCreatedResponse({ description: 'Grocery item added successfully.' })
  async addItem(
    @Param('id') id: string,
    @Body() item: GroceryItemDto,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument> {
    return await this.commandBus.execute<
      AddGroceryItemCommand,
      ShoppingListDocument
    >(new AddGroceryItemCommand(id, new GroceryItem(item), user));
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove a grocery item from a shopping list' })
  @ApiOkResponse({ description: 'Grocery item removed successfully.' })
  async removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument> {
    return await this.commandBus.execute<
      RemoveGroceryItemCommand,
      ShoppingListDocument
    >(new RemoveGroceryItemCommand(id, itemId, user));
  }
}
