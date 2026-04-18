import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import { GroceryItem } from '@shopping-list/entities/grocery-item.entity';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export class AddGroceryItemCommand implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly item: GroceryItem,
    public readonly user: User,
  ) {}
}

@CommandHandler(AddGroceryItemCommand)
export class AddGroceryItemHandler implements ICommandHandler<AddGroceryItemCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(command: AddGroceryItemCommand): Promise<ShoppingList> {
    const userId = command.user._id.toString();
    const shoppingList = await this.repository.addItemForUser(
      command.id,
      userId,
      command.item,
    );

    if (!shoppingList) {
      throw new NotFoundException('Shopping list not found');
    }

    return shoppingList;
  }
}
