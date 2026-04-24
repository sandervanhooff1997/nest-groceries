import { Post, Param, Body } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DuplicateShoppingListCommand } from '@shopping-list/commands/handlers/duplicate-shopping-list.handler';
import { ShareShoppingListCommand } from '@shopping-list/commands/handlers/share-shopping-list.handler';
import { RemoveAccessCommand } from '@shopping-list/commands/handlers/remove-access.handler';
import type { ShoppingListDocument } from '@shopping-list/schemas/shopping-list.schema';
import { AuditingCommandBus } from '@shared/buses/auditing-command-bus';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { User } from '@shared/decorators/user.decorator';
import type { User as AuthenticatedUser } from '@shared/entities/user.entity';
import { DuplicateShoppingListDto } from '@shopping-list/dto/duplicate-shopping-list.dto';
import { ShareShoppingListDto } from '@shopping-list/dto/share-shopping-list.dto';
import { RemoveAccessDto } from '@shopping-list/dto/remove-access.dto';

@ApiTags('shopping-lists')
@ApiController('shopping-lists/:id')
export class ShoppingListActionsController {
  constructor(public readonly commandBus: AuditingCommandBus) {}

  @Post('duplicate')
  @ApiOperation({ summary: 'Duplicate a shopping list for the current user' })
  @ApiCreatedResponse({ description: 'Shopping list duplicated successfully.' })
  async duplicate(
    @Param('id') id: string,
    @Body() duplicateShoppingListDto: DuplicateShoppingListDto,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument> {
    return await this.commandBus.execute<
      DuplicateShoppingListCommand,
      ShoppingListDocument
    >(
      new DuplicateShoppingListCommand(
        id,
        user,
        duplicateShoppingListDto.itemIds,
        duplicateShoppingListDto.itemOverrides,
      ),
    );
  }

  @Post('share')
  @ApiOperation({ summary: 'Share a shopping list with another user' })
  @ApiCreatedResponse({ description: 'Shopping list shared successfully.' })
  async share(
    @Param('id') id: string,
    @Body() shareDto: ShareShoppingListDto,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument> {
    return await this.commandBus.execute<
      ShareShoppingListCommand,
      ShoppingListDocument
    >(
      new ShareShoppingListCommand(id, shareDto.userEmail, shareDto.role, user),
    );
  }

  @Post('remove-access')
  @ApiOperation({ summary: 'Remove access to a shopping list from a user' })
  @ApiOkResponse({ description: 'Access removed successfully.' })
  async removeAccess(
    @Param('id') id: string,
    @Body() removeAccessDto: RemoveAccessDto,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument> {
    return await this.commandBus.execute<
      RemoveAccessCommand,
      ShoppingListDocument
    >(new RemoveAccessCommand(id, removeAccessDto.userEmail, user));
  }
}
