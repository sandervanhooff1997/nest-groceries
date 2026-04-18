import { Body, Delete, Patch, Post, Param } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GroceryItem } from '../../entities/grocery-item.entity';
import { GroceryItemDto } from '../../dto/create-shopping-list.dto';
import { AddGroceryItemCommand } from '../../commands/handlers/add-grocery-item.handler';
import { RemoveGroceryItemCommand } from '../../commands/handlers/remove-grocery-item.handler';
import { SetGroceryItemPurchasedStatusCommand } from '../../commands/handlers/set-grocery-item-purchased-status.handler';
import type { ShoppingListDocument } from '../../schemas/shopping-list.schema';
import { AuditingCommandBus } from '@shared/buses/auditing-command-bus';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { User } from '@shared/decorators/user.decorator';
import type { User as AuthenticatedUser } from '@shared/entities/user.entity';

@ApiTags('shopping-lists')
@ApiController('shopping-lists')
export class GroceryItemsController {
  constructor(public readonly commandBus: AuditingCommandBus) {}

  @Post(':id/items')
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

  @Delete(':id/items/:itemId')
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

  @Patch(':id/items/:itemId/complete')
  @ApiOperation({ summary: 'Mark a grocery item as complete' })
  @ApiOkResponse({ description: 'Grocery item marked as complete.' })
  async completeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument> {
    return await this.commandBus.execute<
      SetGroceryItemPurchasedStatusCommand,
      ShoppingListDocument
    >(new SetGroceryItemPurchasedStatusCommand(id, itemId, true, user));
  }

  @Patch(':id/items/:itemId/uncomplete')
  @ApiOperation({ summary: 'Mark a grocery item as uncomplete' })
  @ApiOkResponse({ description: 'Grocery item marked as uncomplete.' })
  async uncompleteItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument> {
    return await this.commandBus.execute<
      SetGroceryItemPurchasedStatusCommand,
      ShoppingListDocument
    >(new SetGroceryItemPurchasedStatusCommand(id, itemId, false, user));
  }
}
