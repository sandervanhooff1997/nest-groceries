import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import type { IAuditable } from '../../../shared/interfaces/auditable.interface';
import type { User } from '../../../shared/entities/user.entity';

export class FindShoppingListByIdQuery implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly user: User,
  ) {}
}

@QueryHandler(FindShoppingListByIdQuery)
export class FindShoppingListByIdHandler implements IQueryHandler<FindShoppingListByIdQuery> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(query: FindShoppingListByIdQuery) {
    console.log(
      `User ${query.user.fullName} (${query.user.email}) fetched shopping list ${query.id}`,
    );
    return await this.repository.findById(query.id);
  }
}
