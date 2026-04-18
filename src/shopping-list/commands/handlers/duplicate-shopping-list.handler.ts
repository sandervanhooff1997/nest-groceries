import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import { GroceryItem } from '@shopping-list/entities/grocery-item.entity';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export class DuplicateShoppingListCommand implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly user: User,
    public readonly itemIds?: string[],
  ) {}
}

@CommandHandler(DuplicateShoppingListCommand)
export class DuplicateShoppingListHandler implements ICommandHandler<DuplicateShoppingListCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(command: DuplicateShoppingListCommand): Promise<ShoppingList> {
    const userId = command.user._id.toString();
    const sourceShoppingList = await this.repository.findByIdForUser(
      command.id,
      userId,
    );

    if (!sourceShoppingList) {
      throw new NotFoundException('Shopping list not found');
    }

    const sourceItems = sourceShoppingList.items;
    const selectedItemIds =
      command.itemIds && command.itemIds.length > 0
        ? new Set(command.itemIds)
        : null;
    const itemsToDuplicate = selectedItemIds
      ? sourceItems.filter(
          (item): item is GroceryItem =>
            typeof item._id === 'string' && selectedItemIds.has(item._id),
        )
      : sourceItems;

    const duplicatedShoppingList = new ShoppingList({
      name: sourceShoppingList.name,
      nextId: sourceShoppingList._id,
      items: itemsToDuplicate.map((item) => new GroceryItem({ ...item })),
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.repository.create(duplicatedShoppingList);
  }
}
