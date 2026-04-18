import type { GroceryItemDocument } from '../schemas/grocery-item.schema';
import { GroceryItemUnit } from '../enums/grocery-item-unit.enum';

export class GroceryItem {
  _id?: string;
  name: string;
  quantity?: number;
  unit?: GroceryItemUnit;
  purchased?: boolean;

  constructor(partial?: Partial<GroceryItem>) {
    Object.assign(this, partial);
  }

  static fromDocument(this: void, document: GroceryItemDocument): GroceryItem {
    return new GroceryItem({
      _id: document._id?.toString(),
      name: document.name,
      quantity: document.quantity,
      unit: document.unit,
      purchased: document.purchased,
    });
  }

  get displayName(): string {
    if (this.quantity === undefined || this.unit === undefined) {
      return this.name;
    }

    return `${this.name} ${this.quantity} ${this.unit}`;
  }
}
