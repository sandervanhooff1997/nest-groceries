import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export class SetGroceryItemPurchasedStatusCommand implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly itemId: string,
    public readonly purchased: boolean,
    public readonly user: User,
  ) {}
}

@CommandHandler(SetGroceryItemPurchasedStatusCommand)
export class SetGroceryItemPurchasedStatusHandler implements ICommandHandler<SetGroceryItemPurchasedStatusCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(
    command: SetGroceryItemPurchasedStatusCommand,
  ): Promise<ShoppingList> {
    const userId = command.user._id.toString();
    const shoppingList = await this.repository.setItemPurchasedForUser(
      command.id,
      userId,
      command.itemId,
      command.purchased,
    );

    if (!shoppingList) {
      throw new NotFoundException('Shopping list or grocery item not found');
    }

    return shoppingList;
  }
}
