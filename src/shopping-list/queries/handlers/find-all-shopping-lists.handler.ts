import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export class FindAllShoppingListsQuery implements IAuditable {
  constructor(public readonly user: User) {}
}

@QueryHandler(FindAllShoppingListsQuery)
export class FindAllShoppingListsHandler implements IQueryHandler<FindAllShoppingListsQuery> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(query: FindAllShoppingListsQuery) {
    const userId = query.user._id.toString();

    return await this.repository.findAllByUser(userId);
  }
}
