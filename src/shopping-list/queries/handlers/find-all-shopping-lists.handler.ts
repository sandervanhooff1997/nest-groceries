import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindAllShoppingListsQuery } from '../impl/find-all-shopping-lists.query';
import { SHOPPING_LIST_REPOSITORY } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';

@QueryHandler(FindAllShoppingListsQuery)
export class FindAllShoppingListsHandler
  implements IQueryHandler<FindAllShoppingListsQuery>
{
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly repository: IShoppingListRepository,
  ) {}

  async execute(query: FindAllShoppingListsQuery) {
    return await this.repository.findAll();
  }
}

