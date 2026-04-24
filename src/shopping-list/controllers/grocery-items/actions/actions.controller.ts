import { Body, Param, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SetGroceryItemPurchasedStatusCommand } from '@shopping-list/commands/handlers/set-grocery-item-purchased-status.handler';
import { UpdateGroceryItemCommand } from '@shopping-list/commands/handlers/update-grocery-item.handler';
import { UpdateGroceryItemDto } from '@shopping-list/dto/update-grocery-item.dto';
import type { ShoppingListDocument } from '@shopping-list/schemas/shopping-list.schema';
import { AuditingCommandBus } from '@shared/buses/auditing-command-bus';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { User } from '@shared/decorators/user.decorator';
import type { User as AuthenticatedUser } from '@shared/entities/user.entity';

@ApiTags('shopping-lists')
@ApiController('shopping-lists/:id/items/:itemId')
export class GroceryItemActionsController {
  constructor(public readonly commandBus: AuditingCommandBus) {}

  @Patch()
  @ApiOperation({ summary: 'Update a grocery item' })
  @ApiOkResponse({ description: 'Grocery item updated successfully.' })
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateGroceryItemDto,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument> {
    return await this.commandBus.execute<
      UpdateGroceryItemCommand,
      ShoppingListDocument
    >(new UpdateGroceryItemCommand(id, itemId, dto, user));
  }

  @Patch('complete')
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

  @Patch('uncomplete')
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
