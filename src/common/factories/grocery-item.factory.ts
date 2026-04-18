import { GroceryItem } from '@shopping-list/entities/grocery-item.entity';
import { GroceryItemUnit } from '@shopping-list/enums/grocery-item-unit.enum';

export class GroceryItemFactory {
  static create(partial?: Partial<GroceryItem>): GroceryItem {
    return new GroceryItem({
      name: 'Test Item',
      quantity: 1,
      unit: GroceryItemUnit.STUKS,
      purchased: false,
      ...partial,
    });
  }
}
