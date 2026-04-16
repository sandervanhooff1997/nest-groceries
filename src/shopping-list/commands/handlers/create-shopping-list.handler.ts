import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SHOPPING_LIST_REPOSITORY } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingListEntity } from '../../entities/shopping-list.entity';

export class CreateShoppingListCommand {
  constructor(public readonly shoppingList: ShoppingListEntity) {}
}

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


