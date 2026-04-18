import { Post, Param } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DuplicateShoppingListCommand } from '../../commands/handlers/duplicate-shopping-list.handler';
import type { ShoppingListDocument } from '../../schemas/shopping-list.schema';
import { AuditingCommandBus } from '@shared/buses/auditing-command-bus';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { User } from '@shared/decorators/user.decorator';
import type { User as AuthenticatedUser } from '@shared/entities/user.entity';

@ApiTags('shopping-lists')
@ApiController('shopping-lists/:id')
export class ShoppingListActionsController {
  constructor(public readonly commandBus: AuditingCommandBus) {}

  @Post('duplicate')
  @ApiOperation({ summary: 'Duplicate a shopping list for the current user' })
  @ApiCreatedResponse({ description: 'Shopping list duplicated successfully.' })
  async duplicate(
    @Param('id') id: string,
    @User() user: AuthenticatedUser,
  ): Promise<ShoppingListDocument> {
    return await this.commandBus.execute<
      DuplicateShoppingListCommand,
      ShoppingListDocument
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    >(new DuplicateShoppingListCommand(id, user));
  }
}
