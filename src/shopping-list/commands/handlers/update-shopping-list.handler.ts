import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateShoppingListCommand } from '../impl/update-shopping-list.command';
import { SHOPPING_LIST_REPOSITORY } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';

@CommandHandler(UpdateShoppingListCommand)
export class UpdateShoppingListHandler
  implements ICommandHandler<UpdateShoppingListCommand>
{
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly repository: IShoppingListRepository,
  ) {}

  async execute(command: UpdateShoppingListCommand) {
    return await this.repository.update(command.id, command.shoppingList);
  }
}

