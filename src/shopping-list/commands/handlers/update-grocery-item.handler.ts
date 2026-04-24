import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import type { GroceryItemUnit } from '@shopping-list/enums/grocery-item-unit.enum';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export interface GroceryItemPatch {
  name?: string;
  quantity?: number;
  unit?: GroceryItemUnit;
}

export class UpdateGroceryItemCommand implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly itemId: string,
    public readonly patch: GroceryItemPatch,
    public readonly user: User,
  ) {}
}

@CommandHandler(UpdateGroceryItemCommand)
export class UpdateGroceryItemHandler implements ICommandHandler<UpdateGroceryItemCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(command: UpdateGroceryItemCommand): Promise<ShoppingList> {
    const shoppingList = await this.repository.updateItemForUser(
      command.id,
      command.user,
      command.itemId,
      command.patch,
    );

    if (!shoppingList) {
      throw new NotFoundException('Shopping list or grocery item not found');
    }

    return shoppingList;
  }
}
