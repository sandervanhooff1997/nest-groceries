import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export class DeleteShoppingListCommand implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly user: User,
  ) {}
}

@CommandHandler(DeleteShoppingListCommand)
export class DeleteShoppingListHandler implements ICommandHandler<DeleteShoppingListCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(command: DeleteShoppingListCommand) {
    const userId = command.user._id.toString();
    const shoppingList = await this.repository.deleteForUser(
      command.id,
      userId,
    );

    if (!shoppingList) {
      throw new NotFoundException('Shopping list not found');
    }

    return shoppingList;
  }
}
