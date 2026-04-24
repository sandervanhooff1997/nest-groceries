import type { User } from '@shared/entities/user.entity';
import type { ShoppingList } from '../entities/shopping-list.entity';
import type { GroceryItem } from '../entities/grocery-item.entity';

export interface IShoppingListRepository {
  create(shoppingList: ShoppingList): Promise<ShoppingList>;

  findById(id: string): Promise<ShoppingList | null>;
  findAllAccessibleByUser(user: User): Promise<ShoppingList[]>;
  findByIdForUser(id: string, user: User): Promise<ShoppingList | null>;

  /** Adds an internal user `_id` to `ownerIds`. */
  addOwner(
    listId: string,
    ownerInternalId: string,
    actor: User,
  ): Promise<ShoppingList | null>;

  /** Adds an internal user `_id` to `participantIds`. */
  addParticipant(
    listId: string,
    participantInternalId: string,
    actor: User,
  ): Promise<ShoppingList | null>;

  /** Removes an internal user `_id` from both `ownerIds` and `participantIds`. */
  removeMember(
    listId: string,
    memberInternalId: string,
    actor: User,
  ): Promise<ShoppingList | null>;

  deleteForUser(id: string, user: User): Promise<ShoppingList | null>;
  addItemForUser(
    id: string,
    user: User,
    item: GroceryItem,
  ): Promise<ShoppingList | null>;
  removeItemForUser(
    id: string,
    user: User,
    itemId: string,
  ): Promise<ShoppingList | null>;
  setItemPurchasedForUser(
    id: string,
    user: User,
    itemId: string,
    purchased: boolean,
  ): Promise<ShoppingList | null>;
  reorderItemsForUser(
    id: string,
    user: User,
    itemIds: string[],
  ): Promise<ShoppingList | null>;
  updateItemForUser(
    id: string,
    user: User,
    itemId: string,
    patch: Partial<Pick<GroceryItem, 'name' | 'quantity' | 'unit'>>,
  ): Promise<ShoppingList | null>;
  updateForUser(
    id: string,
    user: User,
    patch: { name?: string; items?: GroceryItem[]; isTemplate?: boolean },
  ): Promise<ShoppingList | null>;
}
