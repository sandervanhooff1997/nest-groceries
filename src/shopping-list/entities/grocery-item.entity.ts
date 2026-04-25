import type { GroceryItem as GroceryItemSchema } from '../schemas/grocery-item.schema';
import { GroceryItemUnit } from '../enums/grocery-item-unit.enum';

type GroceryItemSource = Pick<
  GroceryItemSchema,
  'name' | 'quantity' | 'unit' | 'purchased' | 'order' | 'category'
> & {
  _id?: { toString(): string } | string;
};

export class GroceryItem {
  _id?: string;
  name: string;
  quantity?: number;
  unit?: GroceryItemUnit;
  purchased?: boolean;
  order: number;
  category?: string;

  constructor(partial?: Partial<GroceryItem>) {
    Object.assign(this, partial);
  }

  get displayName(): string {
    if (this.quantity === undefined || this.unit === undefined) {
      return this.name;
    }

    return `${this.name} ${this.quantity} ${this.unit}`;
  }

  static fromDocument(this: void, document: GroceryItemSource): GroceryItem {
    return new GroceryItem({
      _id: document._id?.toString(),
      name: document.name,
      quantity: document.quantity,
      unit: document.unit,
      purchased: document.purchased,
      order: document.order,
      category: document.category,
    });
  }
}
