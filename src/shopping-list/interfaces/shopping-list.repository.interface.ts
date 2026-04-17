import type { ShoppingList } from '../entities/shopping-list.entity';

export interface IShoppingListRepository {
  create(shoppingList: ShoppingList): Promise<ShoppingList>;
  findAllByUser(userId: string): Promise<ShoppingList[]>;
  findByIdForUser(id: string, userId: string): Promise<ShoppingList | null>;
  updateForUser(
    id: string,
    userId: string,
    shoppingList: Partial<ShoppingList>,
  ): Promise<ShoppingList | null>;
  deleteForUser(id: string, userId: string): Promise<ShoppingList | null>;
}
