import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindShoppingListByIdQuery } from '../impl/find-shopping-list-by-id.query';
import { SHOPPING_LIST_REPOSITORY } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';

@QueryHandler(FindShoppingListByIdQuery)
export class FindShoppingListByIdHandler
  implements IQueryHandler<FindShoppingListByIdQuery>
{
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly repository: IShoppingListRepository,
  ) {}

  async execute(query: FindShoppingListByIdQuery) {
    return await this.repository.findById(query.id);
  }
}

