import { GroceryItem } from './grocery-item.entity';
import { GroceryItemUnit } from '../enums/grocery-item-unit.enum';

describe('GroceryItem', () => {
  it('should build displayName with name, quantity and unit', () => {
    const item = new GroceryItem({
      name: 'Milk',
      quantity: 2,
      unit: GroceryItemUnit.LITER,
    });

    expect(item.displayName).toBe('Milk 2 Liter');
  });

  it('should return only name when quantity or unit is missing', () => {
    const itemWithoutQuantity = new GroceryItem({
      name: 'Milk',
      unit: GroceryItemUnit.LITER,
    });
    const itemWithoutUnit = new GroceryItem({
      name: 'Milk',
      quantity: 2,
    });

    expect(itemWithoutQuantity.displayName).toBe('Milk');
    expect(itemWithoutUnit.displayName).toBe('Milk');
  });

  it('should map unit enum from document', () => {
    const itemDocument = {
      name: 'Sugar',
      quantity: 500,
      unit: GroceryItemUnit.GRAM,
      purchased: false,
      order: 0,
    };

    const item = GroceryItem.fromDocument(itemDocument);

    expect(item.unit).toBe(GroceryItemUnit.GRAM);
  });
});
