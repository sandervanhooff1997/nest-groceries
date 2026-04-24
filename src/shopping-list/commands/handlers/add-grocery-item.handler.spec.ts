import { NotFoundException } from '@nestjs/common';
import {
  GroceryItemFactory,
  ShoppingListFactory,
  UserFactory,
} from '@common/factories';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import {
  AddGroceryItemCommand,
  AddGroceryItemHandler,
} from './add-grocery-item.handler';

describe('AddGroceryItemHandler', () => {
  const user = UserFactory.create();

  it('should add an item to a user shopping list', async () => {
    const item = GroceryItemFactory.create({ name: 'Bananas' });
    const updatedList = ShoppingListFactory.create({
      _id: 'list-id',
      items: [item],
    });

    const addItemForUser = jest.fn().mockResolvedValue(updatedList);
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAllAccessibleByUser: jest.fn(),
      findByIdForUser: jest.fn(),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
      addOwner: jest.fn(),
      addParticipant: jest.fn(),
      removeMember: jest.fn(),
      addItemForUser,
      removeItemForUser: jest.fn(),
      setItemPurchasedForUser: jest.fn(),
      reorderItemsForUser: jest.fn(),
      updateItemForUser: jest.fn(),
    };
    const handler = new AddGroceryItemHandler(repository);

    const result = await handler.execute(
      new AddGroceryItemCommand('list-id', item, user),
    );

    expect(addItemForUser).toHaveBeenCalledWith('list-id', user, item);
    expect(result).toEqual(updatedList);
  });

  it('should throw when list is not found', async () => {
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAllAccessibleByUser: jest.fn(),
      findByIdForUser: jest.fn(),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
      addOwner: jest.fn(),
      addParticipant: jest.fn(),
      removeMember: jest.fn(),
      addItemForUser: jest.fn().mockResolvedValue(null),
      removeItemForUser: jest.fn(),
      setItemPurchasedForUser: jest.fn(),
      reorderItemsForUser: jest.fn(),
      updateItemForUser: jest.fn(),
    };
    const handler = new AddGroceryItemHandler(repository);

    await expect(
      handler.execute(
        new AddGroceryItemCommand(
          'missing-list-id',
          GroceryItemFactory.create(),
          user,
        ),
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
