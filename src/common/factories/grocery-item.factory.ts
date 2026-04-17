import { GroceryItem } from '@shopping-list/entities/grocery-item.entity';

export class GroceryItemFactory {
  static create(partial?: Partial<GroceryItem>): GroceryItem {
    return new GroceryItem({
      name: 'Test Item',
      quantity: 1,
      unit: 'pcs',
      purchased: false,
      ...partial,
    });
  }
}
