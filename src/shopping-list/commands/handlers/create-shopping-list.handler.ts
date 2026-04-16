import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SHOPPING_LIST_REPOSITORY } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingListEntity } from '../../entities/shopping-list.entity';
import type { IAuditable } from '../../../shared/interfaces/auditable.interface';
import { User } from '../../../shared/entities/user.entity';

export class CreateShoppingListCommand implements IAuditable {
  user: User;

  constructor(
    public readonly shoppingList: ShoppingListEntity,
    user: User,
  ) {
    this.user = user;
  }
}

@CommandHandler(CreateShoppingListCommand)
export class CreateShoppingListHandler
  implements ICommandHandler<CreateShoppingListCommand>
{
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly repository: IShoppingListRepository,
  ) {}

  async execute(command: CreateShoppingListCommand) {
    console.log(
      `User ${command.user.fullName} (${command.user.email}) created shopping list`,
    );
    return await this.repository.create(command.shoppingList);
  }
}


