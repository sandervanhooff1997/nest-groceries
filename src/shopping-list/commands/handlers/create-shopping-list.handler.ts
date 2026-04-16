import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingListEntity } from '../../entities/shopping-list.entity';
import type { IAuditable } from '../../../shared/interfaces/auditable.interface';
import type { User } from '../../../shared/entities/user.entity';

export class CreateShoppingListCommand implements IAuditable {
  constructor(
    public readonly shoppingList: ShoppingListEntity,
    public readonly user: User,
  ) {}
}

@CommandHandler(CreateShoppingListCommand)
export class CreateShoppingListHandler implements ICommandHandler<CreateShoppingListCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(command: CreateShoppingListCommand) {
    console.log(
      `User ${command.user.fullName} (${command.user.email}) created shopping list`,
    );
    return await this.repository.create(command.shoppingList);
  }
}
