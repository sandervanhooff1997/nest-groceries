import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SHOPPING_LIST_REPOSITORY } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';

export class DeleteShoppingListCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteShoppingListCommand)
export class DeleteShoppingListHandler
  implements ICommandHandler<DeleteShoppingListCommand>
{
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly repository: IShoppingListRepository,
  ) {}

  async execute(command: DeleteShoppingListCommand) {
    return await this.repository.delete(command.id);
  }
}

