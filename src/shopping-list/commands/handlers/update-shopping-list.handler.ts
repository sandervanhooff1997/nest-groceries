import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SHOPPING_LIST_REPOSITORY } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingListEntity } from '../../entities/shopping-list.entity';

export class UpdateShoppingListCommand {
  constructor(
    public readonly id: string,
    public readonly shoppingList: Partial<ShoppingListEntity>,
  ) {}
}

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

