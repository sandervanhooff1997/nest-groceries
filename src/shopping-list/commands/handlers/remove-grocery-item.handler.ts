import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export class RemoveGroceryItemCommand implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly itemId: string,
    public readonly user: User,
  ) {}
}

@CommandHandler(RemoveGroceryItemCommand)
export class RemoveGroceryItemHandler implements ICommandHandler<RemoveGroceryItemCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(command: RemoveGroceryItemCommand): Promise<ShoppingList> {
    const userId = command.user._id.toString();
    const shoppingList = await this.repository.removeItemForUser(
      command.id,
      userId,
      command.itemId,
    );

    if (!shoppingList) {
      throw new NotFoundException('Shopping list or grocery item not found');
    }

    return shoppingList;
  }
}
