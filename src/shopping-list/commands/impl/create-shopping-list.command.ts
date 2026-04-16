import { ShoppingListEntity } from '../../entities/shopping-list.entity';

export class CreateShoppingListCommand {
  constructor(public readonly shoppingList: ShoppingListEntity) {}
}

