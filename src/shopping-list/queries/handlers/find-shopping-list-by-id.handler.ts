import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export class FindShoppingListByIdQuery implements IAuditable {
  constructor(
    public readonly id: string,
    public readonly user: User,
  ) {}
}

@QueryHandler(FindShoppingListByIdQuery)
export class FindShoppingListByIdHandler implements IQueryHandler<FindShoppingListByIdQuery> {
  private readonly logger = new Logger(FindShoppingListByIdHandler.name);

  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(query: FindShoppingListByIdQuery) {
    const userId = query.user._id.toString();

    this.logger.log(
      `Fetching shopping list ${query.id} for ${query.user.email}`,
    );

    const shoppingList = await this.repository.findByIdForUser(
      query.id,
      userId,
    );

    if (!shoppingList) {
      throw new NotFoundException('Shopping list not found');
    }

    return shoppingList;
  }
}
