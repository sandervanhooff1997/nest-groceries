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

    const duplicatedShoppingList = new ShoppingList({
      name: sourceShoppingList.name,
      nextId: sourceShoppingList._id,
      items: sourceShoppingList.items.map(
        (item) => new GroceryItem({ ...item }),
      ),
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.repository.create(duplicatedShoppingList);
  }
}
