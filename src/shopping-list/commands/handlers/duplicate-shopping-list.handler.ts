import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import { GroceryItem } from '@shopping-list/entities/grocery-item.entity';
import type { GroceryItemUnit } from '@shopping-list/enums/grocery-item-unit.enum';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export interface ItemOverride {
  id: string;
  quantity?: number;
  unit?: GroceryItemUnit;
}

export class DuplicateShoppingListCommand implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly user: User,
    public readonly itemIds?: string[],
    public readonly itemOverrides?: ItemOverride[],
  ) {}
}

@CommandHandler(DuplicateShoppingListCommand)
export class DuplicateShoppingListHandler implements ICommandHandler<DuplicateShoppingListCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(command: DuplicateShoppingListCommand): Promise<ShoppingList> {
    const sourceShoppingList = await this.repository.findByIdForUser(
      command.id,
      command.user,
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

    const overrideMap = new Map(
      (command.itemOverrides ?? []).map((o) => [o.id, o]),
    );

    const duplicatedShoppingList = new ShoppingList({
      name: sourceShoppingList.name,
      nextId: sourceShoppingList._id,
      items: itemsToDuplicate.map((item) => {
        const override = item._id ? overrideMap.get(item._id) : undefined;
        return new GroceryItem({
          ...item,
          purchased: false,
          ...(override?.quantity !== undefined && {
            quantity: override.quantity,
          }),
          ...(override?.unit !== undefined && { unit: override.unit }),
        });
      }),
      createdBy: command.user.userId,
      updatedBy: command.user.userId,
    });

    return await this.repository.create(duplicatedShoppingList);
  }
}
