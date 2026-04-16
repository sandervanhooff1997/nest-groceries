import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import type { IAuditable } from '../../../shared/interfaces/auditable.interface';
import type { User } from '../../../shared/entities/user.entity';

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
    console.log(
      `User ${command.user.fullName} (${command.user.email}) deleted shopping list ${command.id}`,
    );
    return await this.repository.delete(command.id);
  }
}
