import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export class UpdateShoppingListCommand implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly shoppingList: Partial<ShoppingList>,
    public readonly user: User,
  ) {}
}

@CommandHandler(UpdateShoppingListCommand)
export class UpdateShoppingListHandler implements ICommandHandler<UpdateShoppingListCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(command: UpdateShoppingListCommand) {
    const shoppingList = await this.repository.updateForUser(
      command.id,
      command.user,
      command.shoppingList,
    );

    if (!shoppingList) {
      throw new NotFoundException('Shopping list not found');
    }

    return shoppingList;
  }
}
