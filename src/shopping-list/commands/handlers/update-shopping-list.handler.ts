import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SHOPPING_LIST_REPOSITORY } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingListEntity } from '../../entities/shopping-list.entity';
import type { IAuditable } from '../../../shared/interfaces/auditable.interface';
import type { User } from '../../../shared/entities/user.entity';

export class UpdateShoppingListCommand implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly shoppingList: Partial<ShoppingListEntity>,
    public readonly user: User,
  ) {}
}

@CommandHandler(UpdateShoppingListCommand)
export class UpdateShoppingListHandler
  implements ICommandHandler<UpdateShoppingListCommand>
{
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly repository: IShoppingListRepository,
  ) {}

  async execute(command: UpdateShoppingListCommand) {
    console.log(
      `User ${command.user.fullName} (${command.user.email}) updated shopping list ${command.id}`,
    );
    return await this.repository.update(command.id, command.shoppingList);
  }
}

