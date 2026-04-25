import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import { GroceryItem } from '@shopping-list/entities/grocery-item.entity';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';
import { ItemCategorizerService } from '../../services/item-categorizer.service';

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
    private readonly categorizer: ItemCategorizerService,
  ) {}

  async execute(command: AddGroceryItemCommand): Promise<ShoppingList> {
    const category = this.categorizer.categorize(command.item.name);
    if (category) {
      command.item.category = category;
    }

    const shoppingList = await this.repository.addItemForUser(
      command.id,
      command.user,
      command.item,
    );

    if (!shoppingList) {
      throw new NotFoundException('Shopping list not found');
    }

    return shoppingList;
  }
}
