import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import { GroceryItemFactory } from './grocery-item.factory';
import { UserFactory } from './user.factory';

export class ShoppingListFactory {
  static create(partial?: Partial<ShoppingList>): ShoppingList {
    const user = UserFactory.create();
    return new ShoppingList({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Shopping List',
      items: [GroceryItemFactory.create()],
      createdBy: user._id.toString(),
      updatedBy: user._id.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...partial,
    });
  }
}
