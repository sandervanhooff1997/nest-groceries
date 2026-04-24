import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export class ReorderGroceryItemsCommand implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly itemIds: string[],
    public readonly user: User,
  ) {}
}

@CommandHandler(ReorderGroceryItemsCommand)
export class ReorderGroceryItemsHandler implements ICommandHandler<ReorderGroceryItemsCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(command: ReorderGroceryItemsCommand): Promise<ShoppingList> {
    const shoppingList = await this.repository.reorderItemsForUser(
      command.id,
      command.user,
      command.itemIds,
    );

    if (!shoppingList) {
      throw new NotFoundException(
        'Shopping list not found or item IDs do not match',
      );
    }

    return shoppingList;
  }
}
