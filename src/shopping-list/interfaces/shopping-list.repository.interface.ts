import type { ShoppingList } from '../entities/shopping-list.entity';
import type { GroceryItem } from '../entities/grocery-item.entity';

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
  addItemForUser(
    id: string,
    userId: string,
    item: GroceryItem,
  ): Promise<ShoppingList | null>;
  removeItemForUser(
    id: string,
    userId: string,
    itemId: string,
  ): Promise<ShoppingList | null>;
  setItemPurchasedForUser(
    id: string,
    userId: string,
    itemId: string,
    purchased: boolean,
  ): Promise<ShoppingList | null>;
}
