import type { ShoppingList } from '../entities/shopping-list.entity';

export interface IShoppingListRepository {
  create(shoppingList: ShoppingList): Promise<ShoppingList>;
  findAll(): Promise<ShoppingList[]>;
  findById(id: string): Promise<ShoppingList | null>;
  update(
    id: string,
    shoppingList: Partial<ShoppingList>,
  ): Promise<ShoppingList | null>;
  delete(id: string): Promise<ShoppingList | null>;
}
