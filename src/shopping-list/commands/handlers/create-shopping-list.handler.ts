import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export class CreateShoppingListCommand implements IAuditable {
  constructor(
    public readonly shoppingList: ShoppingList,
    public readonly user: User,
  ) {}
}

@CommandHandler(CreateShoppingListCommand)
export class CreateShoppingListHandler implements ICommandHandler<CreateShoppingListCommand> {
  private readonly logger = new Logger(CreateShoppingListHandler.name);

  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(command: CreateShoppingListCommand) {
    this.logger.log(
      `Creating shopping list for ${command.user.email} (${command.user._id.toString()})`,
    );

    const userId = command.user._id.toString();
    const shoppingList = new ShoppingList({
      ...command.shoppingList,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.repository.create(shoppingList);
  }
}
