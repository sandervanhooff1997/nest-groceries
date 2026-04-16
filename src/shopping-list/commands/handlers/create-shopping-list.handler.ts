import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateShoppingListCommand } from '../impl/create-shopping-list.command';
import { SHOPPING_LIST_REPOSITORY } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';

@CommandHandler(CreateShoppingListCommand)
export class CreateShoppingListHandler
  implements ICommandHandler<CreateShoppingListCommand>
{
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly repository: IShoppingListRepository,
  ) {}

  async execute(command: CreateShoppingListCommand) {
    return await this.repository.create(command.shoppingList);
  }
}


