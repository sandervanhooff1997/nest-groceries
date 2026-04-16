import type { GroceryItem as GroceryItemDocument } from '../schemas/grocery-item.schema';

export class GroceryItem {
  name: string;
  quantity?: number;
  unit?: string;
  purchased?: boolean;

  constructor(partial?: Partial<GroceryItem>) {
    Object.assign(this, partial);
  }

  static fromDocument(this: void, document: GroceryItemDocument): GroceryItem {
    return new GroceryItem({
      name: document.name,
      quantity: document.quantity,
      unit: document.unit,
      purchased: document.purchased,
    });
  }
}
