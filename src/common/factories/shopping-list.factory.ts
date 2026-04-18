import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import { GroceryItemFactory } from './grocery-item.factory';
import { UserFactory } from './user.factory';

export class ShoppingListFactory {
  static create(partial?: Partial<ShoppingList>): ShoppingList {
    const user = UserFactory.create();
    const createdAt = faker.date.past();
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

    return new ShoppingList({
      _id: new Types.ObjectId().toString(),
      name: faker.word.words({ count: { min: 2, max: 4 } }),
      items: [GroceryItemFactory.create()],
      createdBy: user._id.toString(),
      updatedBy: user._id.toString(),
      createdAt,
      updatedAt,
      ...partial,
    });
  }
}
