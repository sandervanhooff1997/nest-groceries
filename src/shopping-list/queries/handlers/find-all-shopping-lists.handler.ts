import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SHOPPING_LIST_REPOSITORY } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import type { IAuditable } from '../../../shared/interfaces/auditable.interface';
import type { User } from '../../../shared/entities/user.entity';

export class FindAllShoppingListsQuery implements IAuditable {
  constructor(public readonly user: User) {}
}

@QueryHandler(FindAllShoppingListsQuery)
export class FindAllShoppingListsHandler
  implements IQueryHandler<FindAllShoppingListsQuery>
{
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly repository: IShoppingListRepository,
  ) {}

  async execute(query: FindAllShoppingListsQuery) {
    console.log(
      `User ${query.user.fullName} (${query.user.email}) fetched all shopping lists`,
    );
    return await this.repository.findAll();
  }
}
