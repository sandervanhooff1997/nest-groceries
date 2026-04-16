import type { ShoppingListDocument } from '../schemas/shopping-list.schema';
import { GroceryItem } from './grocery-item.entity';

export class ShoppingList {
  _id?: string;
  name: string;
  items: GroceryItem[];
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<ShoppingList>) {
    this.items = [];
    Object.assign(this, partial);
  }

  static fromDocument(
    this: void,
    document: ShoppingListDocument,
  ): ShoppingList {
    return new ShoppingList({
      _id: document._id?.toString(),
      name: document.name,
      items: (document.items ?? []).map((item) =>
        GroceryItem.fromDocument(item),
      ),
      createdBy: document.createdBy,
      updatedBy: document.updatedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }
}
