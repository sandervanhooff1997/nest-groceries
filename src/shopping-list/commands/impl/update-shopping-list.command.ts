import { ShoppingListEntity } from '../../entities/shopping-list.entity';

export class UpdateShoppingListCommand {
  constructor(
    public readonly id: string,
    public readonly shoppingList: Partial<ShoppingListEntity>,
  ) {}
}

