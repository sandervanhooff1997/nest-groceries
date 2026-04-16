import type { ShoppingListDocument } from '../schemas/shopping-list.schema';
import type { ShoppingListEntity } from '../entities/shopping-list.entity';

export interface IShoppingListRepository {
  create(shoppingList: ShoppingListEntity): Promise<ShoppingListDocument>;
  findAll(): Promise<ShoppingListDocument[]>;
  findById(id: string): Promise<ShoppingListDocument | null>;
  update(
    id: string,
    shoppingList: Partial<ShoppingListEntity>,
  ): Promise<ShoppingListDocument | null>;
  delete(id: string): Promise<ShoppingListDocument | null>;
}
