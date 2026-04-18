import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { GroceryItem } from '@shopping-list/entities/grocery-item.entity';
import { GroceryItemUnit } from '@shopping-list/enums/grocery-item-unit.enum';

export class GroceryItemFactory {
  static create(partial?: Partial<GroceryItem>): GroceryItem {
    return new GroceryItem({
      _id: new Types.ObjectId().toString(),
      name: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 10 }),
      unit: faker.helpers.arrayElement(Object.values(GroceryItemUnit)),
      purchased: faker.datatype.boolean(),
      ...partial,
    });
  }
}
